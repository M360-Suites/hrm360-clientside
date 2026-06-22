import { ArrowRight, Calendar, ShieldCheck, Clock, PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => {
	return (
		<section className="py-24 bg-[#3b00d9] relative overflow-hidden">
			{/* Decorative elements */}
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
				<div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay"></div>
				<div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full mix-blend-overlay"></div>
			</div>

			<div className="max-w-7xl mx-auto px-6 relative z-10">
				<div className="grid lg:grid-cols-2 gap-16 items-center">
					<div>
						<h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
							Ready to Transform<br/>Your HR Operations?
						</h2>
						<p className="text-xl text-blue-100 mb-10 leading-relaxed">
							Join over 150 companies that have already modernised their HR with HRM360. Transform your workforce management with our custom enterprise solution.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 mb-12">
							<Link to="/register" className="flex items-center justify-center gap-2 bg-white text-[#3b00d9] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">
								Get Started <ArrowRight className="w-5 h-5" />
							</Link>
							<button className="flex items-center justify-center gap-2 bg-[#3000b3] text-white border border-[#4d14e8] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#280099] transition-colors">
								Schedule a Demo
							</button>
						</div>

						<div className="grid grid-cols-2 gap-4 text-blue-100 font-medium">
							<div className="flex items-center gap-2">
								<ShieldCheck className="w-5 h-5 text-emerald-400" /> Enterprise ready
							</div>
							<div className="flex items-center gap-2">
								<Clock className="w-5 h-5 text-emerald-400" /> Set up in hours
							</div>
							<div className="flex items-center gap-2">
								<Lock className="w-5 h-5 text-emerald-400" /> Enterprise security
							</div>
							<div className="flex items-center gap-2">
								<PhoneCall className="w-5 h-5 text-emerald-400" /> Dedicated support
							</div>
						</div>
					</div>

					<div className="relative">
						<div className="absolute inset-0 bg-white/5 rounded-3xl transform rotate-3"></div>
						<div className="absolute inset-0 bg-[#3000b3]/50 rounded-3xl transform -rotate-2"></div>
						<div className="relative bg-white rounded-3xl p-8 shadow-2xl">
							<div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
								<div className="w-12 h-12 rounded-xl bg-[#3b00d9] flex items-center justify-center">
									<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
								</div>
								<div>
									<h3 className="font-bold text-gray-900 text-xl">HRM360</h3>
									<p className="text-gray-500 text-sm">Enterprise Edition</p>
								</div>
							</div>
							<p className="text-gray-600 mb-6 font-medium">
								Get a personalised walkthrough of HRM360 with one of our product experts.
							</p>
							<form className="space-y-4">
								<input type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b00d9] focus:ring-1 focus:ring-[#3b00d9]" />
								<input type="email" placeholder="Work Email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b00d9] focus:ring-1 focus:ring-[#3b00d9]" />
								<button className="w-full bg-[#3b00d9] text-white font-bold py-3 rounded-lg hover:bg-[#3000b3] transition-colors flex items-center justify-center gap-2">
									<Calendar className="w-4 h-4" /> Book Demo
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

const Lock = ({className}: {className?: string}) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
