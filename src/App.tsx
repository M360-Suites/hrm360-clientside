import {
	BrowserRouter,
	Routes,
	Route,
	Navigate,
	Outlet,
} from "react-router-dom";
import { getCookie } from "./utils/cookies";

import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyNotice from "./pages/auth/VerifyNotice";
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

const RequireAuth = () => {
	const token = getCookie("token");

	if (!token) {
		return <Navigate to='/login' replace />;
	}

	return <Outlet />;
};

const RequireOrganization = () => {
	const token = getCookie("token");
	const orgId = getCookie("orgId");
	const isOnboarded = getCookie("isOnboarded") === "true";

	if (!token) {
		return <Navigate to='/login' replace />;
	}

	if (!orgId || !isOnboarded) {
		return <Navigate to='/onboarding' replace />;
	}

	return <Outlet />;
};

const RedirectIfAuthenticated = () => {
	const token = getCookie("token");
	const orgId = getCookie("orgId");
	const isOnboarded = getCookie("isOnboarded") === "true";

	if (token && orgId && isOnboarded) {
		return <Navigate to='/dashboard' replace />;
	}

	if (token && (!orgId || !isOnboarded)) {
		return <Navigate to='/onboarding' replace />;
	}

	return <Outlet />;
};

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<AuthLayout />}>
					<Route element={<RedirectIfAuthenticated />}>
						<Route path='/login' element={<Login />} />
						<Route path='/register' element={<Register />} />
					</Route>

					<Route path='/verify-notice' element={<VerifyNotice />} />
					<Route path='/activation' element={<Activation />} />
					<Route
						path='/forgot-password'
						element={<ForgotPassword />}
					/>

					<Route element={<RequireAuth />}>
						<Route path='/onboarding' element={<Onboarding />} />
					</Route>

					<Route
						path='/'
						element={<Navigate to='/login' replace />}
					/>
				</Route>

				<Route element={<RequireOrganization />}>
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

						<Route
							path='/confirmation'
							element={
								<div className='p-8'>
									Confirmation Page Placeholder
								</div>
							}
						/>

						<Route
							path='/announcement'
							element={
								<div className='p-8'>
									Announcement Page Placeholder
								</div>
							}
						/>

						<Route
							path='/documents'
							element={
								<div className='p-8'>Documents Page Placeholder</div>
							}
						/>
					</Route>
				</Route>

				<Route path='*' element={<Navigate to='/login' replace />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
