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

	const updateField = (
		field: keyof typeof formData,
		value: string,
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const validate = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim())
			newErrors.name = "Full name is required.";
		if (!formData.email.trim())
			newErrors.email = "Email is required.";
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
		`w-full px-4 py-3 rounded-xl border transition-all text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
			errors[field]
				? "border-rose-400 focus:ring-rose-200 focus:border-rose-400"
				: "border-gray-200 focus:ring-[#3B00D9]/20 focus:border-[#3B00D9]"
		}`;

	return (
		<div className='w-full'>
			<div className='text-center mb-8'>
				<h2 className='text-3xl font-bold text-gray-800 mb-2'>
					Create Account
				</h2>
				<p className='text-gray-500'>
					Create your account. You’ll verify your email before login.
				</p>
			</div>

			<form className='space-y-5' onSubmit={handleSubmit} noValidate>
				{error && (
					<div className='p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100'>
						{error}
					</div>
				)}

				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1.5'>
						Full Name
					</label>
					<input
						value={formData.name}
						onChange={(e) => updateField("name", e.target.value)}
						placeholder='Ebenezer Johnson'
						className={fieldCls("name")}
					/>
					{errors.name && (
						<p className='mt-1.5 text-xs text-rose-500'>
							{errors.name}
						</p>
					)}
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1.5'>
						Email Address
					</label>
					<input
						type='email'
						value={formData.email}
						onChange={(e) => updateField("email", e.target.value)}
						placeholder='ebenezer@company.com'
						className={fieldCls("email")}
					/>
					{errors.email && (
						<p className='mt-1.5 text-xs text-rose-500'>
							{errors.email}
						</p>
					)}
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1.5'>
						Company Name
					</label>
					<input
						value={formData.companyName}
						onChange={(e) =>
							updateField("companyName", e.target.value)
						}
						placeholder='BTech 360 Solutions'
						className={fieldCls("companyName")}
					/>
					{errors.companyName && (
						<p className='mt-1.5 text-xs text-rose-500'>
							{errors.companyName}
						</p>
					)}
				</div>

				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1.5'>
						Password
					</label>

					<div className='relative'>
						<input
							type={showPassword ? "text" : "password"}
							value={formData.password}
							onChange={(e) =>
								updateField("password", e.target.value)
							}
							placeholder='Min. 8 characters'
							className={fieldCls("password")}
						/>

						<button
							type='button'
							onClick={() => setShowPassword((prev) => !prev)}
							className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'
						>
							{showPassword ? (
								<EyeOff size={18} />
							) : (
								<Eye size={18} />
							)}
						</button>
					</div>

					{formData.password && (
						<div className='mt-2'>
							<div className='flex gap-1'>
								{[1, 2, 3, 4].map((item) => (
									<div
										key={item}
										className={`h-1.5 flex-1 rounded-full ${
											strength >= item
												? strengthColor[strength]
												: "bg-gray-200"
										}`}
									/>
								))}
							</div>

							<p className='mt-1 text-xs text-gray-500'>
								{strengthLabel[strength]} password
							</p>
						</div>
					)}

					{errors.password && (
						<p className='mt-1.5 text-xs text-rose-500'>
							{errors.password}
						</p>
					)}

					<div className='mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1'>
						{[
							{
								label: "8+ characters",
								ok: formData.password.length >= 8,
							},
							{
								label: "Uppercase letter",
								ok: /[A-Z]/.test(formData.password),
							},
							{
								label: "Number",
								ok: /[0-9]/.test(formData.password),
							},
							{
								label: "Special character",
								ok: /[^A-Za-z0-9]/.test(formData.password),
							},
						].map((item) => (
							<div
								key={item.label}
								className={`flex items-center gap-1 text-xs ${
									item.ok ? "text-emerald-600" : "text-gray-400"
								}`}
							>
								<CheckCircle size={11} />
								{item.label}
							</div>
						))}
					</div>
				</div>

				<div>
					<label className='flex items-start gap-2 text-xs text-gray-500'>
						<input
							type='checkbox'
							checked={agreed}
							onChange={(e) => {
								setAgreed(e.target.checked);
								setErrors((prev) => ({ ...prev, terms: "" }));
							}}
							className='mt-0.5'
						/>
						<span>
							I agree to the Terms of Service and Privacy Policy.
						</span>
					</label>

					{errors.terms && (
						<p className='mt-1.5 text-xs text-rose-500'>
							{errors.terms}
						</p>
					)}
				</div>

				<button
					disabled={isLoading}
					className='w-full py-3.5 bg-[#3B00D9] text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-70'
				>
					{isLoading && (
						<Loader2 className='animate-spin' size={18} />
					)}
					Sign up
				</button>
			</form>

			<p className='text-center mt-8 text-sm text-gray-500'>
				Already verified?{" "}
				<Link
					to='/login'
					className='text-[#3B00D9] font-bold hover:underline'
				>
					Login
				</Link>
			</p>
		</div>
	);
};

export default Register;
