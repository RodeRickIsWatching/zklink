/**
 * global spinner
 */
import React from "react";


const Spinner = ({ className, children, iconClassName }: { className?: string, children?: any, iconClassName?: string }) => {
    if (children) {
        return (
            <div className={`w-full h-full flex items-center justify-center ${className}`}>
                {React.cloneElement(children, {
                    className: `animate-spin size-full ${iconClassName}`,
                })}
            </div>
        );
    }
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <svg
                className={`fill-[#fff] w-[20px] h-[20px] animate-spin loading loading-spinner loading-md ${iconClassName}`}
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="ToastLoading"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.75C9.54675 2.75 7.19397 3.72455 5.45926 5.45926C3.72455 7.19397 2.75 9.54675 2.75 12C2.75 14.4533 3.72455 16.806 5.45926 18.5407C7.19397 20.2754 9.54675 21.25 12 21.25C13.9687 21.25 15.8862 20.6222 17.4736 19.4577C19.0611 18.2933 20.2358 16.6529 20.827 14.775C20.8539 14.678 20.9001 14.5875 20.9628 14.5087C21.0254 14.43 21.1033 14.3646 21.1917 14.3166C21.2802 14.2686 21.3774 14.2388 21.4775 14.2292C21.5777 14.2195 21.6788 14.2301 21.7748 14.2603C21.8708 14.2905 21.9597 14.3397 22.0363 14.405C22.1129 14.4703 22.1755 14.5503 22.2205 14.6404C22.2655 14.7304 22.2919 14.8285 22.2982 14.929C22.3045 15.0294 22.2905 15.1301 22.257 15.225C20.889 19.585 16.816 22.75 12 22.75C6.063 22.75 1.25 17.937 1.25 12C1.25 6.063 6.063 1.25 12 1.25C13.174 1.25 14.306 1.439 15.366 1.788C15.5504 1.85385 15.7017 1.98917 15.7876 2.16506C15.8735 2.34095 15.8873 2.54347 15.8259 2.72937C15.7646 2.91526 15.633 3.06981 15.4592 3.15998C15.2855 3.25016 15.0833 3.26883 14.896 3.212C13.9614 2.90481 12.9838 2.74885 12 2.75Z"></path></svg>
        </div>
    );
};

export default Spinner;
