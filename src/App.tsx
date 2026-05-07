import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Onboarding from "./pages/auth/Onboarding";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Activation from "./pages/auth/Activation";
import Dashboard from "./pages/dashboard/Dashboard";
import Employees from "./pages/employees/Employees";
import Attendance from "./pages/attendance/Attendance";
import Leave from "./pages/leave/Leave";
import Payroll from "./pages/payroll/Payroll";
import Recruitment from "./pages/recruitment/Recruitment";
import Training from "./pages/training/Training";
import Promotion from "./pages/promotion/Promotion";
import Loans from "./pages/loans/Loans";
import Performance from "./pages/performance/Performance";

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				{/* Auth Routes */}
				<Route element={<AuthLayout />}>
					<Route path='/login' element={<Login />} />
					<Route path='/register' element={<Register />} />
					<Route path='/onboarding' element={<Onboarding />} />
					<Route
						path='/forgot-password'
						element={<ForgotPassword />}
					/>
					<Route path='/activation' element={<Activation />} />
					<Route
						path='/'
						element={<Navigate to='/login' replace />}
					/>
				</Route>

				{/* Dashboard Routes */}
				<Route element={<DashboardLayout />}>
					<Route path='/dashboard' element={<Dashboard />} />
					<Route path='/employees' element={<Employees />} />
					<Route path='/attendance' element={<Attendance />} />
					<Route path='/leave' element={<Leave />} />
					<Route path='/payroll' element={<Payroll />} />
					<Route path='/recruitment' element={<Recruitment />} />
					<Route path='/training' element={<Training />} />
					<Route path='/promotion' element={<Promotion />} />
					<Route path='/loans' element={<Loans />} />
					<Route path='/performance' element={<Performance />} />

					{/* Placeholder routes for sidebar links */}
					<Route
						path='/confirmation'
						element={
							<div className='p-8'>
								Confirmation Page (Placeholder)
							</div>
						}
					/>
					<Route
						path='/announcement'
						element={
							<div className='p-8'>
								Announcement Page (Placeholder)
							</div>
						}
					/>
					<Route
						path='/documents'
						element={
							<div className='p-8'>Documents Page (Placeholder)</div>
						}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
};

export default App;
