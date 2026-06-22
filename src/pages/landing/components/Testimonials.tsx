import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export const Testimonials = () => {
	const testimonials = [
		{ quote: "HRM360 transformed how we manage our 400-person team. What used to take my team 3 days now takes 30 minutes. The payroll module alone saved us from countless errors.", author: "Amina Okafor", role: "HR Manager · PrimeEdge Technologies", initials: "AO" },
		{ quote: "The approval workflows and grievance management have completely changed our company culture. Employees feel heard, and leaders have full visibility. Outstanding product.", author: "Chukwuemeka Nwosu", role: "CEO · Arise Financial Group", initials: "CN" },
		{ quote: "From onboarding to offboarding, HRM360 handles everything seamlessly. The analytics dashboard gives me insights I never had before. I can now predict attrition months in advance.", author: "Fatima Al-Hassan", role: "Head of People Operations · Meridian Consulting", initials: "FA" },
		{ quote: "The payroll and loan management integration is exactly what we needed. Repayments are auto-deducted, errors have dropped to zero, and HR-Finance reconciliation is a breeze.", author: "Biodun Adeyemi", role: "CFO · NovaCorp Nigeria", initials: "BA" },
		{ quote: "Managing shift workers across 5 hospital branches was a nightmare before HRM360. Now the attendance module handles everything automatically. I can't imagine going back.", author: "Dr. Ngozi Eze", role: "Director of Administration · BlueWave Hospital Group", initials: "NE" },
		{ quote: "We evaluated 6 HR platforms before choosing HRM360. The combination of the promotions module, analytics, and exceptional support sealed the deal. ROI was clear in month one.", author: "Tunde Akinyemi", role: "VP Human Resources · Pinnacle Group", initials: "TA" }
	];

	return (
		<section id="testimonials" className="py-24 bg-slate-50 border-t border-gray-100">
			<div className="max-w-7xl mx-auto px-6">
				<div className="text-center max-w-3xl mx-auto mb-16">
					<div className="inline-flex items-center gap-2 text-[#3b00d9] font-semibold mb-4 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
						Testimonials
					</div>
					<h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
						HR Leaders Love<br/>
						<span className="text-[#3b00d9]">HRM360</span>
					</h2>
					<p className="text-lg text-gray-600">
						Real reviews from real HR professionals who transformed their organisations with HRM360.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{testimonials.map((test, idx) => (
						<motion.div 
							key={idx}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: idx * 0.05 }}
							className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col relative"
						>
							<Quote className="w-10 h-10 text-gray-100 absolute top-6 right-6" />
							<p className="text-gray-700 italic mb-8 relative z-10 leading-relaxed flex-1">
								"{test.quote}"
							</p>
							<div className="flex items-center gap-4 mt-auto">
								<div className="w-12 h-12 rounded-full bg-[#3b00d9] text-white flex items-center justify-center font-bold text-lg">
									{test.initials}
								</div>
								<div>
									<h4 className="font-bold text-gray-900">{test.author}</h4>
									<p className="text-xs text-gray-500">{test.role}</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};
