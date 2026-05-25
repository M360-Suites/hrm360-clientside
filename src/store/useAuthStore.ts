import { create } from "zustand";
import api from "../api/axios";
import { getCookie, removeCookie, setCookie } from "../utils/cookies";

interface AuthState {
	user: any;
	token: string | null;
	resetToken: string | null;
	isAdmin: boolean;
	isLoading: boolean;
	error: string | null;

	login: (data: any) => Promise<boolean>;
	signup: (data: any) => Promise<boolean>;
	logout: () => void;
	sendCode: (email: string, reason: string) => Promise<boolean>;
	verifyCode: (
		email: string,
		code: string,
		reason: string,
	) => Promise<boolean>;
	resetPassword: (data: {
		token: string;
		newPassword: string;
	}) => Promise<boolean>;
	activateAccount: (token: string) => Promise<boolean>;
	setUser: (user: any) => void;
}

const safeParse = (value: string | null) => {
	try {
		return value ? JSON.parse(value) : null;
	} catch {
		return null;
	}
};

const extractToken = (responseData: any) => {
	return (
		responseData?.token ||
		responseData?.accessToken ||
		responseData?.access_token ||
		responseData?.jwt ||
		responseData?.data?.token ||
		responseData?.data?.accessToken ||
		responseData?.data?.access_token ||
		null
	);
};

const extractRefreshToken = (responseData: any) => {
	return (
		responseData?.refreshToken ||
		responseData?.refresh_token ||
		responseData?.data?.refreshToken ||
		responseData?.data?.refresh_token ||
		null
	);
};

const extractUser = (responseData: any) => {
	return (
		responseData?.user ||
		responseData?.admin ||
		responseData?.data?.user ||
		responseData?.data?.admin ||
		responseData?.data ||
		null
	);
};

const extractUserId = (user: any) => {
	return user?._id || user?.id || user?.userId || null;
};

const extractOrgId = (user: any) => {
	return (
		user?.orgId ||
		user?.organizationId ||
		user?.defaultOrg?._id ||
		user?.defaultOrg?.id ||
		user?.organization?._id ||
		user?.organization?.id ||
		user?.org?._id ||
		user?.org?.id ||
		null
	);
};

const extractDefaultOrgId = (responseData: any) => {
	return (
		responseData?.defaultOrg?._id ||
		responseData?.defaultOrg?.id ||
		responseData?.data?.defaultOrg?._id ||
		responseData?.data?.defaultOrg?.id ||
		null
	);
};

const extractOnboardingState = (user: any) => {
	return Boolean(
		user?.isOnboarded ||
		user?.onboarded ||
		user?.hasCompletedOnboarding ||
		user?.onboardingCompleted ||
		extractOrgId(user),
	);
};

const normalizeOrganizations = (responseData: any) => {
	const data =
		responseData?.data || responseData?.organizations || responseData;

	if (Array.isArray(data)) return data;
	if (Array.isArray(data?.organizations)) return data.organizations;
	if (Array.isArray(data?.data)) return data.data;

	return [];
};

const findUserOrganization = (organizations: any[], user: any) => {
	const userId = extractUserId(user);
	const companyName = user?.companyName;

	return organizations.find((org) => {
		const createdBy =
			typeof org.createdBy === "object"
				? org.createdBy?._id || org.createdBy?.id
				: org.createdBy;

		return (
			createdBy === userId ||
			org.userId === userId ||
			org.ownerId === userId ||
			org.name === companyName
		);
	});
};

const isAdminUser = (user: any) => {
	return (
		!!user && (!user?.role || String(user.role).trim().length === 0)
	);
};

const initialUser = safeParse(getCookie("user"));

export const useAuthStore = create<AuthState>((set) => ({
	user: initialUser,
	token: getCookie("token"),
	resetToken: getCookie("resetToken"),
	isAdmin: initialUser ? isAdminUser(initialUser) : false,
	isLoading: false,
	error: null,

	setUser: (user) => {
		const orgId = extractOrgId(user);
		const isOnboarded = extractOnboardingState(user);
		const isAdmin = isAdminUser(user);

		const updatedUser = {
			...user,
			orgId,
			isOnboarded,
			isAdmin,
		};

		setCookie("user", JSON.stringify(updatedUser));

		if (orgId) setCookie("orgId", orgId);
		setCookie("isOnboarded", String(isOnboarded));

		set({ user: updatedUser, isAdmin });
	},

	login: async (credentials) => {
		set({ isLoading: true, error: null });

		try {
			removeCookie("token");
			removeCookie("refreshToken");
			removeCookie("user");
			removeCookie("orgId");
			removeCookie("isOnboarded");
			removeCookie("resetToken");

			const response = await api.post("/auth/signin", credentials);

			console.log("LOGIN FULL RESPONSE:", response.data);

			const token = extractToken(response.data);
			const refreshToken = extractRefreshToken(response.data);
			const user = extractUser(response.data);

			if (!token)
				throw new Error(
					"Login successful, but no access token was returned.",
				);
			if (!user)
				throw new Error(
					"Login successful, but no user data was returned.",
				);

			setCookie("token", token);

			if (refreshToken) {
				setCookie("refreshToken", refreshToken);
			}

			let orgId = extractOrgId(user) || extractDefaultOrgId(response.data);
			let isOnboarded = extractOnboardingState(user);

			if (orgId) {
				isOnboarded = true;
			}

			if (!orgId) {
				try {
					const orgResponse = await api.get("/org");
					const organizations = normalizeOrganizations(
						orgResponse.data,
					);
					const userOrg = findUserOrganization(organizations, user);

					orgId =
						userOrg?._id || userOrg?.id || userOrg?.orgId || null;

					if (orgId) {
						isOnboarded = true;
					}
				} catch (orgError) {
					console.warn(
						"Could not fetch organization after login:",
						orgError,
					);
				}
			}

			const isAdmin = isAdminUser(user);
			const updatedUser = {
				...user,
				orgId,
				isOnboarded,
				isAdmin,
			};

			setCookie("user", JSON.stringify(updatedUser));

			if (orgId) {
				setCookie("orgId", orgId);
			}

			setCookie("isOnboarded", String(isOnboarded));

			set({
				user: updatedUser,
				token,
				isAdmin,
				resetToken: null,
				isLoading: false,
				error: null,
			});

			return true;
		} catch (error: any) {
			set({
				error:
					error.response?.data?.message ||
					error.response?.data?.error ||
					error.message ||
					"Login failed",
				isLoading: false,
			});

			return false;
		}
	},

	signup: async (userData) => {
		set({ isLoading: true, error: null });

		try {
			await api.post("/auth/signup", userData);

			set({ isLoading: false, error: null });
			return true;
		} catch (error: any) {
			set({
				error:
					error.response?.data?.message ||
					error.response?.data?.error ||
					"Signup failed",
				isLoading: false,
			});

			return false;
		}
	},

	sendCode: async (email, reason) => {
		set({ isLoading: true, error: null });

		try {
			await api.post("/auth/send-code", { email, reason });

			set({ isLoading: false, error: null });
			return true;
		} catch (error: any) {
			set({
				error:
					error.response?.data?.message ||
					error.response?.data?.error ||
					"Failed to send verification code",
				isLoading: false,
			});

			return false;
		}
	},

	verifyCode: async (email, code, reason) => {
		set({ isLoading: true, error: null });

		try {
			const response = await api.post("/auth/verify-code", {
				email,
				code,
				reason,
			});

			const responseData = response.data?.data || response.data;

			const resetToken =
				typeof responseData === "string"
					? responseData
					: responseData?.token ||
						responseData?.resetToken ||
						responseData?.verificationToken ||
						responseData?.accessToken ||
						responseData?.reset_token ||
						responseData?.passwordResetToken;

			if (!resetToken) {
				throw new Error(
					"Code verified, but no reset token was returned.",
				);
			}

			setCookie("resetToken", resetToken);

			set({
				resetToken,
				isLoading: false,
				error: null,
			});

			return true;
		} catch (error: any) {
			set({
				error:
					error.response?.data?.message ||
					error.response?.data?.error ||
					error.message ||
					"Invalid verification code",
				isLoading: false,
			});

			return false;
		}
	},

	resetPassword: async ({ token, newPassword }) => {
		set({ isLoading: true, error: null });

		try {
			await api.post("/auth/reset", {
				token,
				newPassword,
			});

			removeCookie("resetToken");

			set({
				resetToken: null,
				isLoading: false,
				error: null,
			});

			return true;
		} catch (error: any) {
			set({
				error:
					error.response?.data?.message ||
					error.response?.data?.error ||
					"Password reset failed",
				isLoading: false,
			});

			return false;
		}
	},

	activateAccount: async (token) => {
		set({ isLoading: true, error: null });

		try {
			if (!token) {
				throw new Error("Activation token is missing.");
			}

			const response = await api.get("/auth/activation", {
				params: {
					token,
				},
			});

			console.log("ACTIVATION RESPONSE:", response.data);

			set({
				isLoading: false,
				error: null,
			});

			return true;
		} catch (error: any) {
			console.error(
				"ACTIVATION ERROR:",
				error.response?.data || error,
			);

			set({
				error:
					error.response?.data?.message ||
					error.response?.data?.error ||
					error.message ||
					"Activation failed",
				isLoading: false,
			});

			return false;
		}
	},

	logout: () => {
		removeCookie("token");
		removeCookie("refreshToken");
		removeCookie("user");
		removeCookie("orgId");
		removeCookie("isOnboarded");
		removeCookie("resetToken");

		set({
			user: null,
			token: null,
			resetToken: null,
			error: null,
		});
	},
}));
