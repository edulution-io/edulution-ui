const logoutScript = `
    function clearCookies() {
        const cookies = document.cookie.split("; ");
        for (let c of cookies) {
            const d = window.location.hostname.split(".");
            while (d.length > 0) {
                const cookieBase = encodeURIComponent(c.split("=")[0]) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=";
                const domain = d.join(".");
                document.cookie = cookieBase + domain;
                document.cookie = cookieBase + "." + domain;
                d.shift();
            }
        }
    }
    
    localStorage.clear();
    
    sessionStorage.clear();
    
    if ('caches' in window) {
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => caches.delete(key)));
        });
    }
    
    window.indexedDB.databases().then(databases => {
        databases.forEach(db => {
            window.indexedDB.deleteDatabase(db.name);
        });
    });
    
    clearCookies();
    
    window.location.reload(); 
  `;

export default logoutScript;
