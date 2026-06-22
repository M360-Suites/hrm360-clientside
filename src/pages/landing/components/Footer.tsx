import { Zap } from "lucide-react";

export const Footer = () => {
	return (
		<footer className="bg-white border-t border-gray-200 pt-20 pb-10">
			<div className="max-w-7xl mx-auto px-6">
				<div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
					<div className="col-span-2 md:col-span-2 pr-8">
						<div className="flex items-center gap-3 mb-6">
							<div className="w-8 h-8 rounded-lg bg-[#3b00d9] flex items-center justify-center">
								<Zap className="w-4 h-4 text-white fill-white" />
							</div>
							<span className="text-xl font-extrabold tracking-tight text-gray-900">HRM360</span>
						</div>
						<p className="text-gray-600 mb-6 text-sm leading-relaxed max-w-xs">
							The all-in-one HR platform built for modern organisations. Simplify your HR operations, empower your people.
						</p>
						<div className="text-gray-900 font-medium text-sm space-y-2">
							<p>hello@hrm360.io</p>
							<p>+234 800 123 4567</p>
						</div>
					</div>

					<div>
						<h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-wider">Product</h4>
						<ul className="space-y-4 text-sm text-gray-600">
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Features</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Modules</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Solutions</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Changelog</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Roadmap</a></li>
						</ul>
					</div>

					<div>
						<h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-wider">Company</h4>
						<ul className="space-y-4 text-sm text-gray-600">
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">About Us</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Careers</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Blog</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Press</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Partners</a></li>
						</ul>
					</div>

					<div>
						<h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-wider">Support</h4>
						<ul className="space-y-4 text-sm text-gray-600">
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Documentation</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">FAQs</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Status</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Contact Support</a></li>
							<li><a href="#" className="hover:text-[#3b00d9] transition-colors">Training</a></li>
						</ul>
					</div>
				</div>

				<div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 text-sm text-gray-500">
					<div className="flex gap-6 mb-4 md:mb-0">
						<a href="#" className="hover:text-[#3b00d9] transition-colors">Legal</a>
						<a href="#" className="hover:text-[#3b00d9] transition-colors">Privacy Policy</a>
						<a href="#" className="hover:text-[#3b00d9] transition-colors">Terms of Service</a>
						<a href="#" className="hover:text-[#3b00d9] transition-colors">Data Processing</a>
						<a href="#" className="hover:text-[#3b00d9] transition-colors">Cookie Policy</a>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-emerald-500"></div>
						All systems operational
					</div>
				</div>
				<div className="text-center mt-8 text-sm text-gray-400">
					&copy; {new Date().getFullYear()} HRM360. All rights reserved. Built with care for African enterprises.
				</div>
			</div>
		</footer>
	);
};
