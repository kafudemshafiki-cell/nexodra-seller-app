// =========================================
// BRICK C — NEXODRA SERVICE WORKER
// =========================================

const NEXODRA_CACHE =
    'nexodra-app-v4';


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
            'BRICK C — Service worker installing.'
        );

        event.waitUntil(

            caches.open(
                NEXODRA_CACHE
            ).then(
                cache => {

                    console.log(
                        'BRICK C — Opening new cache:',
                        NEXODRA_CACHE
                    );

                    return cache.addAll(
                        NEXODRA_APP_FILES
                    );

                }
            ).then(
                () => {

                    console.log(
                        'BRICK C — New app files cached.'
                    );

                }
            ).catch(
                error => {

                    console.error(
                        'BRICK C — Cache install FAILED:',
                        error
                    );

                    throw error;

                }
            )

        );

        /*
         * Activate the new worker immediately.
         */

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
            'BRICK C — Service worker activating.'
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
                                cacheName => {

                                    console.log(
                                        'BRICK C — Deleting old cache:',
                                        cacheName
                                    );

                                    return caches.delete(
                                        cacheName
                                    );

                                }
                            )

                    );

                }

            ).then(
                () => {

                    console.log(
                        'BRICK C — Old caches removed.'
                    );

                    return self.clients.claim();

                }
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
        // APP FILES
        // NETWORK FIRST
        // -------------------------------------

        const isAppFile =
            requestUrl.pathname.endsWith(
                '/index.html'
            ) ||
            requestUrl.pathname.endsWith(
                '/app.js'
            ) ||
            requestUrl.pathname.endsWith(
                '/style.css'
            ) ||
            requestUrl.pathname.endsWith(
                '/manifest.json'
            );


        if (isAppFile) {

            event.respondWith(

                fetch(request)
                    .then(
                        networkResponse => {

                            /*
                             * Save the newest successful
                             * application file.
                             */

                            if (
                                networkResponse.ok
                            ) {

                                const responseClone =
                                    networkResponse.clone();

                                caches.open(
                                    NEXODRA_CACHE
                                ).then(
                                    cache => {

                                        cache.put(
                                            request,
                                            responseClone
                                        );

                                    }
                                );

                            }

                            return networkResponse;

                        }
                    )
                    .catch(
                        () => {

                            /*
                             * If the network is unavailable,
                             * fall back to the cached version.
                             */

                            return caches.match(
                                request
                            );

                        }
                    )

            );

            return;

        }


        // -------------------------------------
        // OTHER SAME-ORIGIN REQUESTS
        // -------------------------------------
        //
        // Do NOT cache these automatically.
        //
        // This is important for routes such as:
        //
        // /store/odro
        //
        // and prevents a 404 or route response from
        // becoming permanently cached.
        // -------------------------------------

        event.respondWith(

            fetch(request)
                .catch(
                    () => {

                        /*
                         * For navigation requests,
                         * fall back to the app shell.
                         */

                        if (
                            request.mode ===
                            'navigate'
                        ) {

                            return caches.match(
                                './index.html'
                            );

                        }

                        return Response.error();

                    }
                )

        );

    }
);