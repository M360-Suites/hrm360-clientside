import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, UploadCloud } from "lucide-react";
import { useOrgStore } from "../../store/useOrgStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getCookie, setCookie } from "../../utils/cookies";

const companySizes = ["1-10", "11-50", "51-200", "200+"];

const structures = [
	"Single location",
	"Multiple locations (has branches)",
	"Remote Team",
	"Remote & office (Hybrid)",
];

const Onboarding = () => {
	const navigate = useNavigate();

	const { user, setUser } = useAuthStore();
	const { createOrg, completeOnboarding, isLoading, error } =
		useOrgStore();

	const [step, setStep] = useState(1);

	const [formData, setFormData] = useState({
		companySize: "1-10",
		structure: "Single location",
		address: "",
		logo: "",
	});

	const updateField = (
		field: keyof typeof formData,
		value: string,
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleNext = () => {
		if (step < 3) {
			setStep((prev) => prev + 1);
		}
	};

	const handleBack = () => {
		if (step > 1) {
			setStep((prev) => prev - 1);
		}
	};

	const handleSubmit = async () => {
		const createdBy = user?._id || user?.id || user?.userId;

		if (!createdBy) {
			navigate("/login", { replace: true });
			return;
		}

		const orgCreated = await createOrg({
			name: user?.companyName || "Untitled Organization",
			subtext: "",
			tagline: "",
			image: formData.logo,
			stats: [],
			createdBy,
		});

		if (!orgCreated) return;

		const orgId = getCookie("orgId");

		if (!orgId) return;

		const onboarded = await completeOnboarding({
			orgId,
			companySize: formData.companySize,
			structure: formData.structure,
			address: formData.address,
			logo: formData.logo,
		});

		if (!onboarded) return;

		const updatedUser = {
			...user,
			orgId,
			isOnboarded: true,
		};

		setCookie("orgId", orgId);
		setCookie("isOnboarded", "true");
		setCookie("user", JSON.stringify(updatedUser));

		setUser(updatedUser);

		navigate("/dashboard", { replace: true });
	};

	return (
		<div className='min-h-screen w-full bg-white flex items-center justify-center px-4 py-10'>
			<div className='w-full max-w-md'>
				{error && (
					<div className='mb-5 p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100'>
						{error}
					</div>
				)}

				{step === 1 && (
					<div>
						<h2 className='text-base font-medium text-gray-900 mb-6'>
							What is your company size?
						</h2>

						<div className='space-y-4'>
							{companySizes.map((size) => (
								<button
									key={size}
									type='button'
									onClick={() => updateField("companySize", size)}
									className={`w-full h-14 px-5 rounded-md border flex items-center gap-3 text-sm transition-all ${
										formData.companySize === size
											? "border-[#7B2FFF] text-[#7B2FFF]"
											: "border-gray-200 text-gray-600 hover:border-gray-300"
									}`}
								>
									<span
										className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
											formData.companySize === size
												? "border-[#7B2FFF]"
												: "border-gray-300"
										}`}
									>
										{formData.companySize === size && (
											<span className='w-1.5 h-1.5 rounded-full bg-[#7B2FFF]' />
										)}
									</span>

									{size}
								</button>
							))}
						</div>
					</div>
				)}

				{step === 2 && (
					<div>
						<h2 className='text-base font-medium text-gray-900 mb-6'>
							What is your company structure?
						</h2>

						<div className='space-y-4'>
							{structures.map((structure) => (
								<button
									key={structure}
									type='button'
									onClick={() => updateField("structure", structure)}
									className={`w-full h-14 px-5 rounded-md border flex items-center gap-3 text-sm transition-all ${
										formData.structure === structure
											? "border-[#7B2FFF] text-[#7B2FFF]"
											: "border-gray-200 text-gray-600 hover:border-gray-300"
									}`}
								>
									<span
										className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
											formData.structure === structure
												? "border-[#7B2FFF]"
												: "border-gray-300"
										}`}
									>
										{formData.structure === structure && (
											<span className='w-1.5 h-1.5 rounded-full bg-[#7B2FFF]' />
										)}
									</span>

									{structure}
								</button>
							))}
						</div>
					</div>
				)}

				{step === 3 && (
					<div>
						<h1 className='text-3xl font-semibold text-gray-900 leading-tight mb-2'>
							Let’s personalize your experience
						</h1>

						<p className='text-sm text-gray-500 mb-10'>
							Set your company logo and address to feel like home.
						</p>

						<div className='space-y-6'>
							<div>
								<label className='block text-sm text-gray-700 mb-2'>
									Enter Company’s address
								</label>

								<input
									type='text'
									value={formData.address}
									onChange={(e) =>
										updateField("address", e.target.value)
									}
									className='w-full h-12 px-4 rounded-md border border-gray-200 focus:outline-hidden focus:border-[#7B2FFF] focus:ring-2 focus:ring-[#7B2FFF]/10'
								/>
							</div>

							<div>
								<label className='block text-sm text-gray-700 mb-2'>
									Upload company’s logo
								</label>

								<div className='h-32 rounded-md bg-gray-100 flex flex-col items-center justify-center text-center'>
									<UploadCloud
										size={26}
										className='text-[#7B2FFF] mb-2'
									/>

									<label className='text-sm text-gray-700 cursor-pointer'>
										Upload a jpeg
										<input
											type='file'
											accept='image/jpeg,image/png,image/webp'
											className='hidden'
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (!file) return;

												const imageUrl = URL.createObjectURL(file);
												updateField("logo", imageUrl);
											}}
										/>
									</label>

									<p className='text-xs text-[#7B2FFF] mt-1'>
										Not more than 5mb
									</p>
								</div>

								{formData.logo && (
									<img
										src={formData.logo}
										alt='Company logo preview'
										className='mt-3 w-16 h-16 rounded-md object-cover border'
									/>
								)}
							</div>
						</div>
					</div>
				)}

				<div className='flex items-center justify-between mt-10'>
					{step > 1 ? (
						<button
							type='button'
							onClick={handleBack}
							className='px-5 py-3 rounded-md border border-gray-200 text-sm text-gray-600'
						>
							Back
						</button>
					) : (
						<div />
					)}

					{step < 3 ? (
						<button
							type='button'
							onClick={handleNext}
							className='px-6 py-3 rounded-md bg-[#7B2FFF] text-white text-sm font-medium'
						>
							Continue
						</button>
					) : (
						<button
							type='button'
							onClick={handleSubmit}
							disabled={isLoading || !formData.address}
							className='px-6 py-3 rounded-md bg-[#7B2FFF] text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2'
						>
							{isLoading && (
								<Loader2 size={16} className='animate-spin' />
							)}
							Finish
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default Onboarding;
