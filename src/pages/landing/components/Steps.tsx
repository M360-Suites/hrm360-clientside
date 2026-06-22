import { motion } from "framer-motion";

export const Steps = () => {
	const steps = [
		{
			num: "01",
			title: "Set Up Your Organisation",
			desc: "Configure your company structure — departments, branches, job grades, leave policies, and payroll settings in under an hour.",
			points: ["Company branding & profile", "Department & team structure", "Pay scales & allowances", "Holiday calendar setup"]
		},
		{
			num: "02",
			title: "Import or Add Employees",
			desc: "Bulk import existing employee data via Excel, or onboard new hires one-by-one with guided profile completion.",
			points: ["Bulk Excel import", "Document collection", "Role & permission assignment", "Welcome email automation"]
		},
		{
			num: "03",
			title: "Go Live in Minutes",
			desc: "Enable the modules you need — attendance, payroll, leaves — and invite your team. HRM360 handles the rest.",
			points: ["Module activation", "Manager & staff onboarding", "Mobile app setup", "Integration configuration"]
		},
		{
			num: "04",
			title: "Automate & Scale",
			desc: "Let HRM360 automate payroll runs, approval chains, and compliance reports while you focus on your people.",
			points: ["Auto payroll runs", "Scheduled reports", "Compliance automation", "AI-powered insights"]
		}
	];

	return (
		<section id="how-it-works" className="py-24 bg-white border-t border-gray-100">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center max-w-3xl mx-auto mb-16">
					<div className="inline-flex items-center gap-2 text-[#3b00d9] font-semibold mb-4 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
						Getting Started
					</div>
					<h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
						Up and Running in<br/>
						<span className="text-[#3b00d9]">4 Simple Steps</span>
					</h2>
					<p className="text-lg text-gray-600">
						From zero to a fully operative HR platform — no IT team, no complicated setup required.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{steps.map((step, idx) => (
						<motion.div 
							key={step.num}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: idx * 0.1 }}
							className="relative"
						>
							<div className="text-5xl font-black text-gray-100 mb-4 tracking-tighter">{step.num}</div>
							<h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
							<p className="text-sm text-gray-600 mb-6 min-h-[80px]">{step.desc}</p>
							<ul className="space-y-3">
								{step.points.map(point => (
									<li key={point} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
										<div className="w-5 h-5 rounded-full bg-[#3b00d9]/10 text-[#3b00d9] flex flex-shrink-0 items-center justify-center mt-0.5">
											<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
										</div>
										{point}
									</li>
								))}
							</ul>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};
