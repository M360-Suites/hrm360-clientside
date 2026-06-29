import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Steps } from "./components/Steps";
import { Testimonials } from "./components/Testimonials";
import { FAQ } from "./components/FAQ";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/cookies";

const LandingPage = () => {
	const navigate = useNavigate();

	useEffect(() => {
		const hasVisited = getCookie("hasVisitedLandingPage");
		const token = getCookie("token");

		if (hasVisited === "true") {
			if (token) {
				navigate("/dashboard", { replace: true });
			} else {
				navigate("/login", { replace: true });
			}
		}
	}, [navigate]);

	return (
		<div className="min-h-screen bg-slate-50 font-sans selection:bg-[#3b00d9]/20 selection:text-[#3b00d9]">
			<Navbar />
			<main>
				<Hero />
				<Features />
				<Steps />
				<Testimonials />
				<FAQ />
				<CTA />
			</main>
			<Footer />
		</div>
	);
};

export default LandingPage;
