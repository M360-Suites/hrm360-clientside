import { motion } from "framer-motion";
import { Zap, ShieldCheck, Smartphone, Globe, Bell, ChartColumn, RefreshCw, Cloud, Users, Clock, Calendar, DollarSign, TrendingUp, CreditCard, CheckCircle, MessageSquare, Megaphone, PieChart, FileText, CheckSquare, Lock } from "lucide-react";

export const Features = () => {
	const coreFeatures = [
		{ icon: Zap, title: "Lightning Fast Performance", desc: "Blazing-fast page loads and real-time data sync so your team never waits on the platform." },
		{ icon: ShieldCheck, title: "Enterprise-Grade Security", desc: "End-to-end encryption, 2FA, role-based access control, and audit trails on every action." },
		{ icon: Smartphone, title: "Mobile-First Design", desc: "Full-featured mobile app for iOS and Android. Approve leaves, check payslips, anywhere." },
		{ icon: Globe, title: "Multi-Branch Support", desc: "Manage multiple offices, locations and departments from a single unified dashboard." },
		{ icon: Bell, title: "Smart Notifications", desc: "In-app, email, and WhatsApp alerts for approvals, deadlines, payroll and policy changes." },
		{ icon: ChartColumn, title: "Advanced Analytics", desc: "Beautiful dashboards with exportable reports, workforce insights and predictive analytics." },
		{ icon: RefreshCw, title: "Seamless Integrations", desc: "Connect with tools you already use — accounting software, ERP systems, and more via API." },
		{ icon: Cloud, title: "Cloud & On-Premise", desc: "Deploy on our secure cloud or host on your own infrastructure. You choose what fits best." },
	];

	const modules = [
		{ 
			icon: Users, title: "Employee Management", desc: "Complete employee lifecycle — from onboarding to exit. Manage profiles, documents, departments, designations, and org charts.",
			tags: ["Profile Management", "Org Charts", "Document Vault", "Role Assignment"]
		},
		{ 
			icon: Clock, title: "Attendance Tracking", desc: "Real-time attendance monitoring with biometric integrations, geo-fencing, shift scheduling and overtime tracking.",
			tags: ["Biometric Sync", "Geo-fencing", "Shift Scheduling", "Overtime Alerts"]
		},
		{ 
			icon: Calendar, title: "Leave Management", desc: "Streamlined leave requests, approvals, and balance tracking. Configure custom leave types, policies and carry-over rules.",
			tags: ["Leave Policies", "Request Workflow", "Balance Tracking", "Calendar View"]
		},
		{ 
			icon: DollarSign, title: "Payroll Processing", desc: "Fully automated payroll with tax calculations, deductions, bonuses, net pay computation and one-click payslip generation.",
			tags: ["Auto Calculation", "Tax Deductions", "Payslip PDF", "Bank Upload"]
		},
		{ 
			icon: TrendingUp, title: "Promotions & Appraisals", desc: "Manage performance reviews, salary increments, promotions and career progression tracking with structured workflows.",
			tags: ["KPI Tracking", "Performance Reviews", "Salary Increments", "Career Path"]
		},
		{ 
			icon: CreditCard, title: "Loan Management", desc: "Handle employee loan requests, approvals, disbursements and automated repayment schedules deducted from payroll.",
			tags: ["Loan Applications", "Credit Checks", "Auto Deductions", "Repayment Schedule"]
		},
		{
			icon: CheckCircle, title: "Approvals Workflow", desc: "Multi-level approval flows for any HR request. Configure custom approval chains with email and in-app notifications.",
			tags: ["Multi-level Chains", "Auto Escalation", "Email Notifications", "Audit Logs"]
		},
		{
			icon: MessageSquare, title: "Grievance Management", desc: "Confidential grievance filing and resolution tracking. Ensure employee wellbeing with structured complaint resolution.",
			tags: ["Anonymous Filing", "Case Tracking", "SLA Monitoring", "Resolution Reports"]
		},
		{
			icon: Megaphone, title: "Announcements", desc: "Broadcast company-wide announcements, newsletters, and policy updates. Target by department, location, or role.",
			tags: ["Targeted Blasts", "Pin Announcements", "Read Receipts", "Rich Media"]
		},
		{
			icon: PieChart, title: "HR Analytics", desc: "Deep insights into workforce data — turnover, attendance trends, payroll analytics, headcount and hiring forecasts.",
			tags: ["Custom Reports", "Trend Charts", "Export to Excel", "Scheduled Reports"]
		},
		{
			icon: FileText, title: "Document Management", desc: "Centralised document storage for contracts, ID cards, certificates and signed agreements with e-signature support.",
			tags: ["Secure Storage", "E-Signatures", "Expiry Alerts", "Access Control"]
		},
		{
			icon: CheckSquare, title: "Task Manager", desc: "Assign tasks, track progress, and collaborate across teams with deadlines, priorities, and status boards built for HR workflows.",
			tags: ["Task Assignments", "Progress Boards", "Deadline Alerts", "Priority Tags"]
		},
		{
			icon: Lock, title: "Role & Permissions", desc: "Granular role-based access control. Define what each user can view, edit, approve or export across all modules.",
			tags: ["Custom Roles", "Module Permissions", "Data Scoping", "Activity Logs"]
		}
	];

	return (
		<>
			<section id="features" className="py-24 bg-white border-t border-gray-100">
				<div className="max-w-7xl mx-auto px-6">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<div className="inline-flex items-center gap-2 text-[#3b00d9] font-semibold mb-4 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
							<ShieldCheck className="w-5 h-5" /> Core Features
						</div>
						<h2 className="text-4xl font-extrabold text-gray-900 mb-6">
							Built for Scale.<br/>
							<span className="text-[#3b00d9]">Designed for Simplicity.</span>
						</h2>
						<p className="text-lg text-gray-600">Enterprise power without enterprise complexity. HRM360 is designed to grow with your organisation.</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{coreFeatures.map((feat, idx) => (
							<motion.div 
								key={idx}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: idx * 0.05 }}
								className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-[#3b00d9] transition-colors"
							>
								<div className="w-12 h-12 rounded-xl bg-[#3b00d9]/10 text-[#3b00d9] flex items-center justify-center mb-6">
									<feat.icon className="w-6 h-6" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
								<p className="text-gray-600 leading-relaxed text-sm">{feat.desc}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section id="modules" className="py-24 bg-slate-50 border-t border-gray-100">
				<div className="max-w-7xl mx-auto px-6">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<div className="inline-flex items-center gap-2 text-[#3b00d9] font-semibold mb-4 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
							<Zap className="w-5 h-5" /> All Modules
						</div>
						<h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
							Everything Your HR Team <br/>
							<span className="text-[#3b00d9]">Will Ever Need</span>
						</h2>
						<p className="text-lg text-gray-600 mb-8">
							13 powerful modules working together as one unified platform. No more juggling multiple tools.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{modules.map((mod, idx) => (
							<motion.div 
								key={idx}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: idx * 0.05 }}
								className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col"
							>
								<div className="flex items-center gap-3 mb-4">
									<div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-[#3b00d9]/10 text-[#3b00d9]`}>
										<mod.icon className="w-5 h-5" />
									</div>
									<h4 className="font-bold text-lg text-gray-900">{mod.title}</h4>
								</div>
								<p className="text-sm text-gray-600 mb-6 flex-1">{mod.desc}</p>
								<div className="flex flex-wrap gap-2 mt-auto">
									{mod.tags.map(tag => (
										<span key={tag} className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
											{tag}
										</span>
									))}
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>
		</>
	);
};
