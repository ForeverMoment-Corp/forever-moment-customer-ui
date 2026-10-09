export const generateUniqueSessionID = function () {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const randomPart = arr[0].toString().padStart(10, "0");
    const timestamp = Date.now(); // 13 digits
    return `_${timestamp}${randomPart.slice(0, 3)}`;
};

export const setLoginSession = (name: string, value: string) => {
    if (window.localStorage) {
        //const sessionId = generateUniqueSessionID();
        localStorage.setItem(name, value);
    }
};

export const getLoginSession = (name: string) => {
    if (window.localStorage) {
        const sessionId = localStorage.getItem(name);
        return sessionId;
    } else {
        return null;
    }
};

export const removeLoginSession = (name: string) => {
    if (window.localStorage) {
        localStorage.removeItem(name);
    }
};

export function getCookie(name: string) {
    let v = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
    return v ? v[2] : null;
}

export function setCookie(name: string, value: string | number, days: number, domain: string) {
    let d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = `${name}=${value};domain=${domain};path=/;expires=${d.toGMTString()}`;
}

export function deleteCookie(name: string) {
    setCookie(name, "", -1, "");
}

const STORAGE_PREFIX = 'forever_moment_';

export const storage = {
    getToken: () => {
        try {
            return getLoginSession(`${STORAGE_PREFIX}token`) || getLoginSession('access_token');
        } catch {
            return null;
        }
    },
    setToken: (token: string) => {
        setLoginSession(`${STORAGE_PREFIX}token`, token);
        setLoginSession('access_token', token);
    },
    clearToken: () => {
        removeLoginSession(`${STORAGE_PREFIX}token`);
        removeLoginSession('access_token');
    },
    getUser: () => {
        try {
            const userStr = getLoginSession(`${STORAGE_PREFIX}user`);
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    },
    setUser: (user: any) => {
        setLoginSession(`${STORAGE_PREFIX}user`, JSON.stringify(user));
    },
    clearUser: () => {
        removeLoginSession(`${STORAGE_PREFIX}user`);
    },
    clearAll: () => {
        removeLoginSession(`${STORAGE_PREFIX}token`);
        removeLoginSession('access_token');
        removeLoginSession(`${STORAGE_PREFIX}user`);
    }
};
