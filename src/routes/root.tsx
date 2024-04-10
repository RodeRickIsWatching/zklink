import { useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { IntlProvider } from "react-intl";
import type { UserInfo } from "../contexts/user";
import { UserContext } from "../contexts/user";

export default function Root() {
    const [userInfo, setUserInfo] = useState<UserInfo>();

    const user = useMemo(() => ({ userInfo, setUserInfo }), [userInfo]);

    return (
        <IntlProvider
            locale="en-US"
            messages={{ login: "Login", foo: "Foo", bar: "Bar" }}
        >
            <UserContext.Provider value={user}>
                <Outlet />
            </UserContext.Provider>
        </IntlProvider>
    );
}
