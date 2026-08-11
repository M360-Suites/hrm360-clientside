import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (password: string) => {
	let score = 0;
	if (password.length >= 8) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;
	return score;
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = [
	"",
	"bg-rose-400",
	"bg-amber-400",
	"bg-blue-400",
	"bg-emerald-500",
];

const Register = () => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		companyName: "",
		password: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { signup, isLoading, error } = useAuthStore();

	const strength = getPasswordStrength(formData.password);

	const updateField = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) newErrors.name = "Full name is required.";
		if (!formData.email.trim()) newErrors.email = "Email is required.";
		else if (!emailRegex.test(formData.email)) {
			newErrors.email = "Please enter a valid email address.";
		}
		if (!formData.companyName.trim()) {
			newErrors.companyName = "Company name is required.";
		}
		if (!formData.password.trim()) {
			newErrors.password = "Password is required.";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters.";
		} else if (strength < 2) {
			newErrors.password = "Password is too weak.";
		}
		if (!agreed) newErrors.terms = "You must agree to the terms.";

		return newErrors;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}
		const success = await signup(formData);
		if (success) {
			navigate("/verify-notice", {
				replace: true,
				state: { email: formData.email },
			});
		}
	};

	const fieldCls = (field: string) =>
		`w-full px-4 py-3 bg-white/10 rounded-xl border text-sm text-white placeholder:text-white/40 transition-all outline-none focus:ring-2 ${
			errors[field]
				? "border-rose-400/80 focus:ring-rose-400/20"
				: "border-white/20 focus:ring-white/20 focus:border-white/40"
		}`;

	return (
		<div className="w-full max-w-sm rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md p-8 shadow-xl overflow-y-auto max-h-[calc(100vh-6rem)]">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-white mb-1.5">Create account</h2>
				<p className="text-sm text-white/50">
					You'll verify your email before logging in.
				</p>
			</div>

			<form className="space-y-4" onSubmit={handleSubmit} noValidate>
				{error && (
					<div className="p-3 text-xs text-rose-300 bg-rose-500/10 rounded-xl border border-rose-400/20">
						{error}
					</div>
				)}

				{/* Full Name */}
				<div>
					<label className="block text-xs font-medium text-white/60 mb-1.5">
						Full Name
					</label>
					<input
						value={formData.name}
						onChange={(e) => updateField("name", e.target.value)}
						placeholder="Ebenezer Johnson"
						className={fieldCls("name")}
					/>
					{errors.name && (
						<p className="mt-1.5 text-xs text-rose-400">{errors.name}</p>
					)}
				</div>

				{/* Email */}
				<div>
					<label className="block text-xs font-medium text-white/60 mb-1.5">
						Email Address
					</label>
					<input
						type="email"
						value={formData.email}
						onChange={(e) => updateField("email", e.target.value)}
						placeholder="name@company.com"
						className={fieldCls("email")}
					/>
					{errors.email && (
						<p className="mt-1.5 text-xs text-rose-400">{errors.email}</p>
					)}
				</div>

				{/* Company Name */}
				<div>
					<label className="block text-xs font-medium text-white/60 mb-1.5">
						Company Name
					</label>
					<input
						value={formData.companyName}
						onChange={(e) => updateField("companyName", e.target.value)}
						placeholder="BTech 360 Solutions"
						className={fieldCls("companyName")}
					/>
					{errors.companyName && (
						<p className="mt-1.5 text-xs text-rose-400">{errors.companyName}</p>
					)}
				</div>

				{/* Password */}
				<div>
					<label className="block text-xs font-medium text-white/60 mb-1.5">
						Password
					</label>
					<div className="relative">
						<input
							type={showPassword ? "text" : "password"}
							value={formData.password}
							onChange={(e) => updateField("password", e.target.value)}
							placeholder="Min. 8 characters"
							className={fieldCls("password")}
						/>
						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
						>
							{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>

					{/* Strength bar */}
					{formData.password && (
						<div className="mt-2.5">
							<div className="flex gap-1 mb-1.5">
								{[1, 2, 3, 4].map((item) => (
									<div
										key={item}
										className={`h-1 flex-1 rounded-full transition-colors ${
											strength >= item ? strengthColor[strength] : "bg-white/10"
										}`}
									/>
								))}
							</div>
							<p className="text-xs text-white/40">
								{strengthLabel[strength]} password
							</p>
						</div>
					)}

					{errors.password && (
						<p className="mt-1.5 text-xs text-rose-400">{errors.password}</p>
					)}

					{/* Password hints */}
					{formData.password && (
						<div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
							{[
								{ label: "8+ characters", ok: formData.password.length >= 8 },
								{ label: "Uppercase", ok: /[A-Z]/.test(formData.password) },
								{ label: "Number", ok: /[0-9]/.test(formData.password) },
								{ label: "Special char", ok: /[^A-Za-z0-9]/.test(formData.password) },
							].map((item) => (
								<div
									key={item.label}
									className={`flex items-center gap-1 text-[11px] transition-colors ${
										item.ok ? "text-emerald-400" : "text-white/30"
									}`}
								>
									<CheckCircle size={10} />
									{item.label}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Terms */}
				<div>
					<label className="flex items-start gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={agreed}
							onChange={(e) => {
								setAgreed(e.target.checked);
								setErrors((prev) => ({ ...prev, terms: "" }));
							}}
							className="mt-0.5 accent-[#2563EB]"
						/>
						<span className="text-xs text-white/40 leading-relaxed">
							I agree to the Terms of Service and Privacy Policy.
						</span>
					</label>
					{errors.terms && (
						<p className="mt-1.5 text-xs text-rose-400">{errors.terms}</p>
					)}
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full mt-1 py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
				>
					{isLoading && <Loader2 className="animate-spin" size={16} />}
					Create account
				</button>
			</form>

			<p className="text-center mt-5 text-xs text-white/40">
				Already have an account?{" "}
				<Link
					to="/login"
					className="text-white/70 font-semibold hover:text-white transition-colors"
				>
					Sign in
				</Link>
			</p>
		</div>
	);
};

export default Register;
