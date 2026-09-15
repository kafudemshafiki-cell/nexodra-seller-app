// =========================================
// BRICK 1J — NEXODRA SERVICE WORKER
// =========================================

const NEXODRA_CACHE =
    'nexodra-app-v3';


const NEXODRA_APP_FILES = [
    './',
    './index.html',
    './app.js',
    './style.css',
    './manifest.json',
    './assets/nexodra-icon-192.png',
    './assets/nexodra-icon-512.png'
];


// =========================================
// INSTALL
// =========================================

self.addEventListener(
    'install',
    event => {

        console.log(
            'BRICK 1K-D1 — Service worker installing.'
        );

        event.waitUntil(

            caches.open(
                NEXODRA_CACHE
            ).then(
                cache => {

                    console.log(
                        'BRICK 1K-D1 — cache opened.'
                    );

                    return cache.addAll(
                        NEXODRA_APP_FILES
                    );

                }
            ).then(
                () => {

                    console.log(
                        'BRICK 1K-D1 — install cache SUCCESS.'
                    );

                }
            ).catch(
                error => {

                    console.error(
                        'BRICK 1K-D1 — install cache FAILED:',
                        error
                    );

                    throw error;

                }
            )

        );

        self.skipWaiting();
    }
);


// =========================================
// ACTIVATE
// =========================================

self.addEventListener(
    'activate',
    event => {

        console.log(
            'BRICK 1J — Service worker activating.'
        );

        event.waitUntil(

            caches.keys().then(
                cacheNames => {

                    return Promise.all(

                        cacheNames
                            .filter(
                                cacheName =>
                                    cacheName !==
                                    NEXODRA_CACHE
                            )
                            .map(
                                cacheName =>
                                    caches.delete(
                                        cacheName
                                    )
                            )

                    );

                }

            ).then(
                () =>
                    self.clients.claim()
            )

        );
    }
);


// =========================================
// FETCH
// =========================================

self.addEventListener(
    'fetch',
    event => {

        const request =
            event.request;


        // -------------------------------------
        // ONLY HANDLE GET REQUESTS
        // -------------------------------------

        if (
            request.method !==
            'GET'
        ) {
            return;
        }


        // -------------------------------------
        // ONLY HANDLE SAME-ORIGIN REQUESTS
        // -------------------------------------

        const requestUrl =
            new URL(
                request.url
            );

        if (
            requestUrl.origin !==
            self.location.origin
        ) {
            return;
        }


        // -------------------------------------
        // CACHE FIRST
        // -------------------------------------

        event.respondWith(

            caches.match(
                request
            ).then(
                cachedResponse => {

                    if (
                        cachedResponse
                    ) {
                        return cachedResponse;
                    }

                    return fetch(
                        request
                    );

                }
            )

        );

    }
);

