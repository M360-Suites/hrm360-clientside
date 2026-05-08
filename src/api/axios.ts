import axios, {
	type AxiosError,
	type InternalAxiosRequestConfig,
} from "axios";
import { getCookie, removeCookie, setCookie } from "../utils/cookies";

const api = axios.create({
	baseURL:
		import.meta.env.VITE_API_URL ||
		"https://hrm360-backend.onrender.com/api",
	withCredentials: true,
});

const publicAuthRoutes = [
	"/auth/signin",
	"/auth/signup",
	"/auth/send-code",
	"/auth/verify-code",
	"/auth/reset",
	"/auth/activation",
	"/auth/refresh",
];

let isRefreshing = false;
let failedQueue: {
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
}[] = [];

const processQueue = (
	error: unknown,
	token: string | null = null,
) => {
	failedQueue.forEach((promise) => {
		if (error) {
			promise.reject(error);
		} else if (token) {
			promise.resolve(token);
		}
	});

	failedQueue = [];
};

const clearSession = () => {
	removeCookie("token");
	removeCookie("refreshToken");
	removeCookie("user");
	removeCookie("orgId");
	removeCookie("resetToken");
};

api.interceptors.request.use(
	(config) => {
		const token = getCookie("token");
		const orgId = getCookie("orgId");

		const url = config.url || "";
		const isPublicAuthRoute = publicAuthRoutes.some((route) =>
			url.startsWith(route),
		);

		if (token && !isPublicAuthRoute) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		if (orgId && !isPublicAuthRoute) {
			config.headers["x-org-id"] = orgId;
		}

		console.log(
			"API Request:",
			config.method?.toUpperCase(),
			config.url,
			{
				headers: config.headers,
				body: config.data,
			},
		);

		return config;
	},
	(error) => Promise.reject(error),
);

api.interceptors.response.use(
	(response) => {
		console.log("API Response:", response.config.url, response.data);
		return response;
	},
	async (error: AxiosError<any>) => {
		const originalRequest =
			error.config as InternalAxiosRequestConfig & {
				_retry?: boolean;
			};

		const status = error.response?.status;
		const message = error.response?.data?.message || "";

		const isExpiredToken =
			status === 401 &&
			typeof message === "string" &&
			message.toLowerCase().includes("token has expired");

		if (!isExpiredToken || originalRequest._retry) {
			console.error("API Error:", {
				status,
				url: error.config?.url,
				message: error.response?.data,
			});

			return Promise.reject(error);
		}

		originalRequest._retry = true;

		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject });
			})
				.then((newToken) => {
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return api(originalRequest);
				})
				.catch((queueError) => Promise.reject(queueError));
		}

		isRefreshing = true;

		try {
			const refreshToken = getCookie("refreshToken");

			const refreshResponse = await axios.post(
				`${import.meta.env.VITE_API_URL || "https://hrm360-backend.onrender.com/api"}/auth/refresh`,
				refreshToken ? { refreshToken } : {},
				{
					withCredentials: true,
				},
			);

			console.log("REFRESH RESPONSE:", refreshResponse.data);

			const responseData =
				refreshResponse.data?.data || refreshResponse.data;

			const newAccessToken =
				responseData?.accessToken ||
				responseData?.token ||
				responseData?.access_token;

			if (!newAccessToken) {
				throw new Error(
					"Refresh successful, but no access token was returned.",
				);
			}

			setCookie("token", newAccessToken);

			processQueue(null, newAccessToken);

			originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

			return api(originalRequest);
		} catch (refreshError) {
			processQueue(refreshError, null);
			clearSession();

			window.location.href = "/login";

			return Promise.reject(refreshError);
		} finally {
			isRefreshing = false;
		}
	},
);

export default api;
