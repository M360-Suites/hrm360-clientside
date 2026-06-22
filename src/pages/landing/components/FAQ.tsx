import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export const FAQ = () => {
	const faqs = [
		"How long does it take to set up HRM360?",
		"Can I migrate data from our existing HR system?",
		"Is my company data secure?",
		"Can employees access HRM360 on mobile?",
		"What payroll configurations are supported?",
		"Does HRM360 support multi-branch organisations?",
		"Can I customize approval workflows?"
	];

	return (
		<section id="faq" className="py-24 bg-white border-t border-gray-100">
			<div className="max-w-4xl mx-auto px-6">
				<div className="text-center max-w-3xl mx-auto mb-16">
					<div className="inline-flex items-center gap-2 text-[#3b00d9] font-semibold mb-4 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
						FAQ
					</div>
					<h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
						Frequently Asked<br/>
						<span className="text-[#3b00d9]">Questions</span>
					</h2>
					<p className="text-lg text-gray-600">
						Everything you need to know about HRM360. Can't find the answer? <a href="#" className="text-[#3b00d9] font-medium hover:underline">Chat with us</a>
					</p>
				</div>

				<div className="space-y-4">
					{faqs.map((q, idx) => (
						<motion.div 
							key={idx}
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: idx * 0.05 }}
							className="border border-gray-200 rounded-xl p-6 flex justify-between items-center cursor-pointer hover:border-[#3b00d9] transition-colors bg-slate-50"
						>
							<h4 className="font-bold text-gray-900">{q}</h4>
							<Plus className="w-5 h-5 text-gray-400" />
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};
