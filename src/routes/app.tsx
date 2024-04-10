import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "./layout/header";
import Footer from "./layout/footer";

export default function App() {
    return (
        <div className="min-h-screen overflow-auto text-[#fff]">
            <Header />
            <div className="w-full h-screen mt-[64px] bg-[#000000] overflow-auto">
                <Suspense>
                    <div className="min-h-[840px] py-[80px]">
                        <Outlet />
                    </div>
                </Suspense>
                <Footer />
            </div>
        </div>
    );
}
