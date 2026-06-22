import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Play, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
	return (
		<section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 bg-slate-50 overflow-hidden">
			<div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="flex justify-center mb-8"
				>
					<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm">
						<span className="bg-[#3b00d9] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">NEW</span>
						<span className="text-sm font-medium text-gray-700 pr-2">Introducing AI-Powered HR Analytics</span>
						<ChevronRight className="w-4 h-4 text-[#3b00d9]" />
					</div>
				</motion.div>

				<motion.h1 
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="text-center text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6"
				>
					The Smartest Way <br />
					<span className="text-[#3b00d9]">to Manage Your</span> <br />
					Entire Workforce
				</motion.h1>

				<motion.p 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="text-center text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
				>
					HRM360 unifies employee management, payroll, attendance, leaves, promotions, loans, approvals, grievances & announcements into one seamless platform. Built for organisations that move fast.
				</motion.p>

				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
				>
					<Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#3b00d9] hover:bg-[#3000b3] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-md hover:-translate-y-0.5">
						Get Started <ArrowRight className="w-5 h-5" />
					</Link>
					<button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:-translate-y-0.5 shadow-sm">
						<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
							<Play className="w-4 h-4 text-[#3b00d9] fill-[#3b00d9] ml-1" />
						</div>
						Watch Demo
					</button>
				</motion.div>

				{/* Dashboard Mockup built with HTML/Tailwind */}
				<motion.div 
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="relative max-w-5xl mx-auto"
				>
					{/* Floating badges */}
					<div className="absolute top-[20%] -right-8 z-20 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-100 flex items-center gap-2 animate-bounce" style={{animationDuration: '3s'}}>
						<div className="w-2 h-2 rounded-full bg-[#3b00d9] animate-pulse"></div>
						<span className="text-[#3b00d9] font-semibold text-sm">Live</span>
						<span className="text-gray-700 text-sm font-medium">Payroll Processed</span>
					</div>
					<div className="absolute bottom-[20%] -left-8 z-20 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-100 flex items-center gap-2 animate-bounce" style={{animationDuration: '4s'}}>
						<TrendingUp className="w-4 h-4 text-emerald-500" />
						<span className="text-gray-700 text-sm font-medium">+23% Efficiency</span>
					</div>

					<div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
						{/* Mockup Header */}
						<div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50">
							<div className="flex gap-2">
								<div className="w-3 h-3 rounded-full bg-red-400"></div>
								<div className="w-3 h-3 rounded-full bg-amber-400"></div>
								<div className="w-3 h-3 rounded-full bg-emerald-400"></div>
							</div>
							<div className="mx-auto bg-white rounded-md px-3 py-1 text-xs text-gray-500 border border-gray-200 w-64 text-center">
								app.hrm360.io/dashboard
							</div>
							<div className="w-12"></div> {/* spacer */}
						</div>

						{/* Mockup Body */}
						<div className="flex h-[400px]">
							{/* Sidebar */}
							<div className="w-56 border-r border-gray-100 p-4 flex flex-col gap-2">
								<div className="flex items-center gap-2 mb-6 px-2">
									<div className="w-8 h-8 rounded-lg bg-[#3b00d9] flex items-center justify-center">
										<Users className="w-4 h-4 text-white" />
									</div>
									<span className="font-bold text-gray-900">HRM360</span>
								</div>
								
								<div className="px-3 py-2 rounded-lg bg-[#3b00d9]/10 text-[#3b00d9] font-medium text-sm">Dashboard</div>
								<div className="px-3 py-2 text-gray-600 font-medium text-sm hover:bg-gray-50 rounded-lg">Employees</div>
								<div className="px-3 py-2 text-gray-600 font-medium text-sm hover:bg-gray-50 rounded-lg">Attendance</div>
								<div className="px-3 py-2 text-gray-600 font-medium text-sm hover:bg-gray-50 rounded-lg">Payroll</div>
								<div className="px-3 py-2 text-gray-600 font-medium text-sm hover:bg-gray-50 rounded-lg">Leave</div>
								<div className="px-3 py-2 text-gray-600 font-medium text-sm hover:bg-gray-50 rounded-lg">Approvals</div>
							</div>

							{/* Main Content */}
							<div className="flex-1 bg-slate-50 p-6 flex flex-col gap-6 overflow-hidden">
								<div className="flex justify-between items-center">
									<div>
										<h2 className="text-xl font-bold text-gray-900">Good Morning, Admin</h2>
										<p className="text-sm text-gray-500">Monday, March 31, 2026</p>
									</div>
									<button className="bg-[#3b00d9] text-white px-4 py-2 rounded-full text-sm font-medium">
										+ Add Employee
									</button>
								</div>

								{/* Metric Cards */}
								<div className="grid grid-cols-3 gap-4">
									<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
										<p className="text-xs text-gray-500 mb-2">Total Employees</p>
										<p className="text-2xl font-bold text-gray-900">1,247</p>
										<p className="text-xs text-[#3b00d9] font-medium mt-1">+12%</p>
									</div>
									<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
										<p className="text-xs text-gray-500 mb-2">Present Today</p>
										<p className="text-2xl font-bold text-gray-900">1,089</p>
										<p className="text-xs text-[#3b00d9] font-medium mt-1">87.3%</p>
									</div>
									<div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
										<p className="text-xs text-gray-500 mb-2">Pending Approvals</p>
										<p className="text-2xl font-bold text-gray-900">23</p>
										<p className="text-xs text-orange-500 font-medium mt-1">Urgent</p>
									</div>
								</div>

								{/* Chart Area */}
								<div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex-1 flex flex-col">
									<div className="flex justify-between items-center mb-6">
										<h3 className="text-sm font-semibold text-gray-900">Attendance Overview</h3>
										<span className="text-xs text-gray-500">This Month</span>
									</div>
									<div className="flex-1 flex items-end gap-2">
										{[40, 50, 45, 60, 55, 48, 65, 58, 42, 62, 50, 45, 55, 75].map((height, i) => (
											<div key={i} className={`flex-1 rounded-t-sm ${i === 13 ? 'bg-[#3b00d9]' : 'bg-[#3b00d9]/20'}`} style={{ height: `${height}%` }}></div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Metrics Section Below Hero */}
			<div className="max-w-5xl mx-auto w-full px-6 mt-24 z-10">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden">
					<div className="bg-white p-8 text-center">
						<div className="text-3xl md:text-4xl font-extrabold text-[#3b00d9] mb-1">10,000+</div>
						<div className="text-sm text-gray-600 font-medium">Active Employees Managed</div>
					</div>
					<div className="bg-white p-8 text-center">
						<div className="text-3xl md:text-4xl font-extrabold text-[#3b00d9] mb-1">98%</div>
						<div className="text-sm text-gray-600 font-medium">Uptime Guarantee</div>
					</div>
					<div className="bg-white p-8 text-center">
						<div className="text-3xl md:text-4xl font-extrabold text-[#3b00d9] mb-1">60%</div>
						<div className="text-sm text-gray-600 font-medium">HR Time Saved</div>
					</div>
					<div className="bg-white p-8 text-center">
						<div className="text-3xl md:text-4xl font-extrabold text-[#3b00d9] mb-1">150+</div>
						<div className="text-sm text-gray-600 font-medium">Companies Trust Us</div>
					</div>
				</div>

				{/* Trusted By Logos */}
				<div className="mt-16 text-center">
					<p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Trusted by leading organisations</p>
					<div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60">
						<span className="text-xl font-bold text-gray-500">NovaCorp</span>
						<span className="text-xl font-bold text-gray-500">Pinnacle Group</span>
						<span className="text-xl font-bold text-gray-500">Arise Bank</span>
						<span className="text-xl font-bold text-gray-500">TechVault</span>
						<span className="text-xl font-bold text-gray-500">BlueWave</span>
						<span className="text-xl font-bold text-gray-500">Meridian Inc</span>
						<span className="text-xl font-bold text-gray-500">PrimeEdge</span>
						<span className="text-xl font-bold text-gray-500">Centrix</span>
					</div>
				</div>
			</div>
		</section>
	);
};
