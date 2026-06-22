import { motion } from "framer-motion";
import { Zap, Menu } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
	return (
		<motion.nav 
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200"
		>
			<div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-[#3b00d9] flex items-center justify-center shadow-md">
						<Zap className="w-5 h-5 text-white fill-white" />
					</div>
					<span className="text-2xl font-extrabold tracking-tight text-gray-900">HRM360</span>
				</Link>

				<div className="hidden md:flex items-center gap-8">
					<a href="#features" className="text-sm font-medium text-gray-600 hover:text-[#3b00d9] transition-colors">Features</a>
					<a href="#modules" className="text-sm font-medium text-gray-600 hover:text-[#3b00d9] transition-colors">Modules</a>
					<a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-[#3b00d9] transition-colors">How It Works</a>
					<a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-[#3b00d9] transition-colors">Testimonials</a>
					<a href="#faq" className="text-sm font-medium text-gray-600 hover:text-[#3b00d9] transition-colors">FAQ</a>
				</div>

				<div className="hidden md:flex items-center gap-4">
					<Link to="/login" className="text-sm font-medium text-gray-700 hover:text-[#3b00d9] px-4 py-2 transition-colors">
						Sign In
					</Link>
					<Link to="/register" className="bg-[#3b00d9] hover:bg-[#3000b3] text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors shadow-sm">
						Get Started
					</Link>
				</div>

				<button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
					<Menu className="w-6 h-6" />
				</button>
			</div>
		</motion.nav>
	);
};
