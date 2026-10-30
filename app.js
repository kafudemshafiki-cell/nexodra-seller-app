// =========================================
// C8-A — NEXODRA STARTUP SPLASH
// =========================================

const nexodraStartupSplash =
    document.getElementById(
        'nexodraStartupSplash'
    );

function hideNexodraStartupSplash() {

    if (!nexodraStartupSplash) {
        return;
    }

    nexodraStartupSplash.classList.add(
        'is-hidden'
    );

    console.log(
        'C8-A — Nexodra startup splash hidden.'
    );

    setTimeout(() => {

        if (
            nexodraStartupSplash &&
            nexodraStartupSplash.parentNode
        ) {

            nexodraStartupSplash.remove();

        }

    }, 400);

}


/*
 * C8-A intentionally keeps the splash
 * visible briefly on startup.
 *
 * C8-B will later connect this to
 * authentication/session routing.
 */

// =========================================
// C8-B — STARTUP SPLASH ROUTING CONTROL
// =========================================

// =========================================
// C8-C — SMART STARTUP SPLASH TIMING
// =========================================

let nexodraStartupRoutingComplete = false;

const nexodraStartupStartedAt =
    Date.now();

const NEXODRA_MIN_STARTUP_DURATION =
    1200;

function completeNexodraStartup() {

    if (nexodraStartupRoutingComplete) {
        return;
    }

    nexodraStartupRoutingComplete = true;

    const elapsed =
        Date.now() -
        nexodraStartupStartedAt;

    const remaining =
        Math.max(
            0,
            NEXODRA_MIN_STARTUP_DURATION -
            elapsed
        );

    console.log(
        'C8-C — Startup routing complete.',
        'elapsed:',
        elapsed,
        'remaining:',
        remaining
    );

    setTimeout(
        () => {

            hideNexodraStartupSplash();

            console.log(
                'C8-C — Startup splash released.'
            );

        },
        remaining
    );
}

// =========================================
// C8-H — STARTUP SPLASH FAILSAFE
// =========================================

const NEXODRA_STARTUP_FAILSAFE =
    8000;

setTimeout(() => {

    if (
        !nexodraStartupRoutingComplete
    ) {

        console.warn(
            'C8-H — Startup routing exceeded failsafe time. Releasing splash.'
        );

        nexodraStartupRoutingComplete =
            true;

        hideNexodraStartupSplash();

    }

}, NEXODRA_STARTUP_FAILSAFE);

// =========================================
// C8-D — NEXODRA ONBOARDING REFERENCES
// =========================================

const nexodraOnboarding =
    document.getElementById(
        'nexodraOnboarding'
    );

const nexodraOnboardingNext =
    document.getElementById(
        'nexodraOnboardingNext'
    );

const nexodraOnboardingSkip =
    document.getElementById(
        'nexodraOnboardingSkip'
    );

console.log(
    'C8-D — Onboarding elements:',
    {
        onboardingExists:
            !!nexodraOnboarding,

        nextButtonExists:
            !!nexodraOnboardingNext,

        skipButtonExists:
            !!nexodraOnboardingSkip
    }
);

// =========================================
// C8-E — FIRST-TIME ONBOARDING ROUTING
// =========================================

const NEXODRA_ONBOARDING_KEY =
    'nexodraOnboardingSeen';

function showNexodraOnboarding() {

    if (!nexodraOnboarding) {
        console.warn(
            'C8-E — Onboarding element not found.'
        );
        return;
    }

    nexodraOnboarding.classList.add(
        'active'
    );

    nexodraOnboarding.setAttribute(
        'aria-hidden',
        'false'
    );

    console.log(
        'C8-E — Nexodra onboarding displayed.'
    );
}

function hideNexodraOnboarding() {

    if (!nexodraOnboarding) {
        return;
    }

    nexodraOnboarding.classList.remove(
        'active'
    );

    nexodraOnboarding.setAttribute(
        'aria-hidden',
        'true'
    );
}

function markNexodraOnboardingSeen() {

    try {

        localStorage.setItem(
            NEXODRA_ONBOARDING_KEY,
            'true'
        );

    } catch (error) {

        console.warn(
            'C8-E — Could not save onboarding state:',
            error
        );

    }

}

function hasSeenNexodraOnboarding() {

    try {

        return (
            localStorage.getItem(
                NEXODRA_ONBOARDING_KEY
            ) === 'true'
        );

    } catch (error) {

        console.warn(
            'C8-E — Could not read onboarding state:',
            error
        );

        return false;
    }

}

// =========================================
// C8-I — ONBOARDING STATE VERIFICATION
// =========================================

function verifyNexodraOnboardingState() {

    const onboardingSeen =
        hasSeenNexodraOnboarding();

    console.log(
        'C8-I — Onboarding state:',
        {
            seen: onboardingSeen
        }
    );

    return onboardingSeen;
}


// =========================================
// C8-E — ONBOARDING BUTTONS
// =========================================

// =========================================
// C8-H — ONBOARDING COMPLETION TRANSITION
// =========================================

if (nexodraOnboardingNext) {

    nexodraOnboardingNext.addEventListener(
        'click',
        () => {

            console.log(
                'C8-H — Onboarding completion started.'
            );

            nexodraOnboardingNext.disabled = true;

            markNexodraOnboardingSeen();

            verifyNexodraOnboardingState();

            hideNexodraOnboarding();

            setTimeout(
                () => {

                    if (authScreen) {

                        authScreen.classList.add(
                            'active'
                        );

                        authScreen.setAttribute(
                            'aria-hidden',
                            'false'
                        );

                    }

                    nexodraOnboardingNext.disabled = false;

                    console.log(
                        'C8-H — Onboarding completed; login screen ready.'
                    );

                },
                180
            );

        }
    );

}

if (nexodraOnboardingSkip) {

    nexodraOnboardingSkip.addEventListener(
        'click',
        () => {

            console.log(
                'C8-E — Onboarding skipped.'
            );

            markNexodraOnboardingSeen();

            hideNexodraOnboarding();

            if (authScreen) {

                authScreen.classList.add(
                    'active'
                );

            }

        }
    );

}

// =========================================
// NEXODRA SELLER APP
// =========================================

// Grab DOM Elements

const navButtons = document.querySelectorAll('.nav-btn');
const screens = document.querySelectorAll('.screen');
const screenTitle = document.getElementById('screenTitle');

const productForm =
    document.getElementById('productForm');

const productGrid =
    document.getElementById('productGrid');
// Product currently being edited
let editingProductId = null;

// =========================================
// SELL / POS STATE
// =========================================

let sellProducts = [];

let currentSaleItems = [];

// =========================================
// BRICK 1E — OFFLINE SALES QUEUE
// =========================================

const ODROP_OFFLINE_SALES_KEY =
    'odropOfflineSalesQueueV1';

let odropOfflineSalesQueue = [];

function loadOdropOfflineSalesQueue() {
    try {
        const savedQueue =
            localStorage.getItem(
                ODROP_OFFLINE_SALES_KEY
            );

        if (!savedQueue) {
            return [];
        }

        const parsedQueue =
            JSON.parse(savedQueue);

        if (!Array.isArray(parsedQueue)) {
            return [];
        }

        console.log(
            'BRICK 1E — Offline sales queue loaded:',
            parsedQueue.length
        );

        return parsedQueue;

    } catch (error) {
        console.error(
            'BRICK 1E — Could not load offline sales queue:',
            error
        );

        return [];
    }
}

function saveOdropOfflineSalesQueue() {
    try {
        localStorage.setItem(
            ODROP_OFFLINE_SALES_KEY,
            JSON.stringify(
                odropOfflineSalesQueue
            )
        );

        console.log(
            'BRICK 1E — Offline sales queue saved:',
            odropOfflineSalesQueue.length
        );

    } catch (error) {
        console.error(
            'BRICK 1E — Could not save offline sales queue:',
            error
        );
    }
}

odropOfflineSalesQueue =
    loadOdropOfflineSalesQueue();

// =========================================
// BRICK 1G — AUTOMATIC OFFLINE SALES SYNC
// =========================================

let odropOfflineSaleSyncRunning = false;


async function syncOdropOfflineSales() {

    // Already syncing
    if (odropOfflineSaleSyncRunning) {
        console.log(
            'BRICK 1G — Sync already running.'
        );

        return;
    }


    // No internet
    if (!navigator.onLine) {
        console.log(
            'BRICK 1G — Device is offline. Sync skipped.'
        );

        return;
    }


    // No queued sales
    if (
        !odropOfflineSalesQueue ||
        odropOfflineSalesQueue.length === 0
    ) {
        console.log(
            'BRICK 1G — No offline sales waiting.'
        );

        return;
    }


    odropOfflineSaleSyncRunning = true;


    console.log(
        'BRICK 1G — Starting offline sales sync:',
        odropOfflineSalesQueue.length
    );


    try {

        // Get the current authenticated user.
        const {
            data: {
                user
            },
            error: userError
        } =
            await supabaseClient.auth.getUser();


        if (userError || !user) {

            console.error(
                'BRICK 1G — Could not get authenticated user:',
                userError
            );

            return;
        }


        // Only sync sales belonging to this user.
        const pendingSales =
            odropOfflineSalesQueue.filter(
                sale =>
                    sale &&
                    sale.syncStatus === 'pending' &&
                    String(sale.userId || '') ===
                    String(user.id)
            );


        if (pendingSales.length === 0) {

            console.log(
                'BRICK 1G — No pending sales for current user.'
            );

            return;
        }


        console.log(
            'BRICK 1G — Pending sales found:',
            pendingSales.length
        );


        // Process sales one at a time.
        for (
            const offlineSale
            of pendingSales
        ) {

            // Internet may disappear during sync.
            if (!navigator.onLine) {

                console.log(
                    'BRICK 1G — Internet lost during sync.'
                );

                break;
            }


            console.log(
                'BRICK 1G — Syncing sale:',
                offlineSale.localSaleId
            );


            const {
                data: saleId,
                error: saleError
            } =
                await supabaseClient.rpc(
                    'complete_sale',
                    {

                        p_items:
                            offlineSale.items,

                        p_items_count:
                            offlineSale.itemsCount,

                        p_subtotal:
                            offlineSale.subtotal,

                        p_discount:
                            offlineSale.discount,

                        p_tax:
                            offlineSale.tax,

                        p_total:
                            offlineSale.total,

                        p_customer_name:
                            offlineSale.customerName,

                        p_note:
                            offlineSale.note || '',

                        p_payment_method:
                            offlineSale.paymentMethod ||
                            'cash'

                    }
                );


            if (saleError) {

                console.error(
                    'BRICK 1G — Sale sync failed:',
                    offlineSale.localSaleId,
                    saleError
                );

                // Leave this sale in the queue.
                // It will be retried later.
                continue;
            }


            console.log(
                'BRICK 1G — Sale synchronized successfully:',
                {
                    localSaleId:
                        offlineSale.localSaleId,

                    supabaseSaleId:
                        saleId
                }
            );


            // Remove ONLY the successfully
            // synchronized sale from the queue.
            odropOfflineSalesQueue =
                odropOfflineSalesQueue.filter(
                    sale =>
                        sale.localSaleId !==
                        offlineSale.localSaleId
                );


            // Save immediately after each success.
            saveOdropOfflineSalesQueue();
        }


    } catch (error) {

        console.error(
            'BRICK 1G — Unexpected sync error:',
            error
        );


    } finally {

        odropOfflineSaleSyncRunning =
            false;


        console.log(
            'BRICK 1G — Offline sales sync finished.'
        );
    }
}


// =========================================
// BRICK 1G — SYNC WHEN INTERNET RETURNS
// =========================================

window.addEventListener(
    'online',
    () => {

        console.log(
            'BRICK 1G — Internet connection restored.'
        );

        syncOdropOfflineSales();

    }
);


// =========================================
// BRICK 1G — TRY SYNC ON APP START
// =========================================

setTimeout(
    () => {

        if (navigator.onLine) {

            syncOdropOfflineSales();

        }

    },
    3000
);

let sellDiscountAmount = 0;

let sellTaxAmount = 0;

// =========================================
// BRICK SELL 1 — SELL / POS DOM REFERENCES
// =========================================

const sellProductGrid =
    document.getElementById('sellProductGrid');

const sellProductsCount =
    document.getElementById('sellProductsCount');

const sellProductSearch =
    document.getElementById('sellProductSearch');

const sellCategories =
    document.getElementById('sellCategories');

const sellCartItems =
    document.getElementById('sellCartItems');

const sellTotalItems =
    document.getElementById('sellTotalItems');

const sellSubtotal =
    document.getElementById('sellSubtotal');

const sellDiscount =
    document.getElementById('sellDiscount');

const sellTax =
    document.getElementById('sellTax');

const sellGrandTotal =
    document.getElementById('sellGrandTotal');

const sellPayAmount =
    document.getElementById('sellPayAmount');

const sellTodayRevenue =
    document.getElementById('sellTodayRevenue');

const sellTodayTransactions =
    document.getElementById('sellTodayTransactions');

const sellTodayItems =
    document.getElementById('sellTodayItems');

const sellPayBtn =
    document.getElementById('sellPayBtn');

const clearSaleBtn =
    document.getElementById('clearSaleBtn');

// =========================================
// BRICK SELL 3B — CURRENT SALE EXPAND / COLLAPSE
// =========================================

const sellCartExpandBtn =
    document.getElementById(
        'sellCartExpandBtn'
    );


const currentSalePanel =
    document.querySelector(
        '.current-sale-panel'
    );


if (
    sellCartExpandBtn &&
    currentSalePanel
) {

    sellCartExpandBtn.addEventListener(
        'click',
        () => {

            const isExpanded =
                sellCartExpandBtn.getAttribute(
                    'aria-expanded'
                ) === 'true';


            const shouldExpand =
                !isExpanded;


            // Update accessibility state
            sellCartExpandBtn.setAttribute(
                'aria-expanded',
                String(shouldExpand)
            );


            // Update panel state
            currentSalePanel.classList.toggle(
                'is-collapsed',
                !shouldExpand
            );


            // Update arrow
            const icon =
                sellCartExpandBtn.querySelector(
                    'i'
                );


            if (icon) {

                icon.classList.toggle(
                    'fa-chevron-down',
                    shouldExpand
                );

                icon.classList.toggle(
                    'fa-chevron-up',
                    !shouldExpand
                );

            }


            console.log(
                'BRICK SELL 3B — Current Sale:',
                shouldExpand
                    ? 'EXPANDED'
                    : 'COLLAPSED'
            );

        }
    );


    console.log(
        'BRICK SELL 3B — Current Sale controller ready.'
    );

}

// =========================================
// BRICK SELL 2 — RENDER SELL PRODUCTS
// =========================================

function renderSellProducts() {

    if (!sellProductGrid) {
        return;
    }


    const searchTerm =
        sellProductSearch
            ? sellProductSearch.value
                .toLowerCase()
                .trim()
            : '';


    const activeCategory =
        sellCategories
            ? sellCategories.querySelector(
                '.sell-category-btn.active'
            )
            : null;


    const selectedCategory =
        activeCategory
            ? activeCategory.getAttribute(
                'data-category'
            )
            : 'all';


    const visibleProducts =
        sellProducts.filter(product => {

            const title =
                String(
                    product.title || ''
                ).toLowerCase();


            const category =
                String(
                    product.category || ''
                );


            const matchesSearch =
                title.includes(searchTerm);


            const matchesCategory =
                selectedCategory === 'all' ||
                category === selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    // Update product count

    if (sellProductsCount) {

        sellProductsCount.textContent =
            `${visibleProducts.length} ${
                visibleProducts.length === 1
                    ? 'product'
                    : 'products'
            }`;

    }


    // No products

    if (visibleProducts.length === 0) {

        sellProductGrid.innerHTML = `

            <div class="sell-empty-state">

                <i class="fa-solid fa-box-open"></i>

                <strong>
                    No products found
                </strong>

                <span>
                    Try another search or category.
                </span>

            </div>

        `;

        return;
    }


    // Render products

    sellProductGrid.innerHTML =
        visibleProducts.map(product => {

            const stock =
                Number(product.stock || 0);


            const price =
                Number(product.price || 0);


            return `

                <div
                    class="sell-product-card"
                    data-product-id="${product.id}"
                >

                    <div class="sell-product-image">

                        ${
                            product.image

                            ? `
                                <img
                                    src="${product.image}"
                                    alt="${product.title || 'Product'}"
                                >
                            `

                            : `
                                <span>
                                    ${product.emoji || '📦'}
                                </span>
                            `
                        }

                    </div>


                    <div class="sell-product-info">

                        <strong>
                            ${product.title || 'Untitled Product'}
                        </strong>


                        <span>
                            ${formatCurrency(price)}
                        </span>


                        <small>
                            Stock: ${stock}
                        </small>

                    </div>


                    ${
                        stock > 0

                        ? `
                            <button
                                type="button"
                                class="sell-decrease-btn"
                                data-product-id="${product.id}"
                                aria-label="Sell ${product.title}"
                            >
                                <i class="fa-solid fa-minus"></i>
                            </button>
                        `

                        : `
                            <span class="sell-out-of-stock">
                                Out of stock
                            </span>
                        `
                    }

                </div>

            `;

        }).join('');

    console.log(
    'BRICK SELL 3 — Products rendered:',
    sellProducts.length
);

}


// =========================================
// BRICK SELL 5 — SELL PRODUCT DECREASE
// =========================================

if (sellProductGrid) {

    sellProductGrid.addEventListener(
        'click',
        (event) => {

            const decreaseButton =
                event.target.closest(
                    '.sell-decrease-btn'
                );

            if (!decreaseButton) {
                return;
            }


            const productId =
    decreaseButton.getAttribute(
        'data-product-id'
    );


           const product =
    sellProducts.find(
        item =>
            String(item.id) === String(productId)
    ); 


            if (!product) {

                console.error(
                    'BRICK SELL 5 — Product not found:',
                    productId
                );

                return;
            }


            const currentStock =
                Number(product.stock || 0);


            // Do not allow selling unavailable stock
            if (currentStock <= 0) {

                console.log(
                    'BRICK SELL 5 — Product is out of stock:',
                    product.title
                );

                return;
            }


            // =====================================
            // REDUCE AVAILABLE STOCK
            // =====================================

            product.stock =
                currentStock - 1;

             checkStockAlert(
    product,
    currentStock
);
          
            // =====================================
            // FIND PRODUCT IN CURRENT SALE
            // =====================================

            const existingCartItem =
    currentSaleItems.find(
        item =>
            String(item.productId) === String(productId)
    );


            if (existingCartItem) {

                existingCartItem.quantity += 1;

            } else {

                currentSaleItems.push({

                    productId:
                        product.id,

                    title:
                        product.title || '',

                    price:
                        Number(product.price || 0),

                    image:
                        product.image || '',

                    emoji:
                        product.emoji || '📦',

                    quantity:
                        1

                });

            }


            console.log(
                'BRICK SELL 5 — Product added to current sale:',
                product
            );


            console.log(
                'BRICK SELL 5 — Current sale:',
                currentSaleItems
            );


            // Refresh product stock display
            renderSellProducts();


            // Refresh current sale
            renderSellCart();

        }
    );

}

// =========================================
// BRICK INBOX 7 — STOCK ALERT CHECK
// =========================================

async function checkStockAlert(
    product,
    oldStock
) {

    const newStock =
        Number(product.stock || 0);


    // OUT OF STOCK

    if (
        newStock === 0 &&
        oldStock > 0
    ) {

        await createNotification({

            type:
                'inventory',

            title:
                'Out of stock',

            message:
                `${product.title} is now out of stock.`,

            icon:
                'fa-solid fa-box-open'

        });


        console.log(
            'BRICK INBOX 7 — Out of stock:',
            product.title
        );

    }


    // LOW STOCK

    else if (
        newStock <= 3 &&
        oldStock > 3
    ) {


        await createNotification({

            type:
                'inventory',

            title:
                'Low stock alert',

            message:
                `${product.title} only has ${newStock} units remaining.`,

            icon:
                'fa-solid fa-triangle-exclamation'

        });


        console.log(
            'BRICK INBOX 7 — Low stock:',
            product.title,
            newStock
        );

    }

}


// =========================================
// BRICK SELL 6 — RENDER CURRENT SALE
// =========================================

function renderSellCart() {

    const cartContainer =
        document.getElementById(
            'sellCartItems'
        );


    if (!cartContainer) {
        return;
    }


    // =====================================
    // EMPTY CART
    // =====================================

    if (currentSaleItems.length === 0) {

        cartContainer.innerHTML = `

            <div class="sell-cart-empty">

                <i class="fa-solid fa-cart-shopping"></i>

                <strong>
                    No products selected
                </strong>

                <span>
                    Tap a product to add it to the sale.
                </span>

            </div>

        `;

        updateSellTotals();

        return;
    }


    // =====================================
    // CART PRODUCTS
    // =====================================

    cartContainer.innerHTML =
        currentSaleItems.map(item => {

            const lineTotal =
                Number(item.price) *
                Number(item.quantity);


            return `

                <div
                    class="sell-cart-item"
                    data-product-id="${item.productId}"
                >

                    <div class="sell-cart-item-image">

                        ${
                            item.image

                            ? `
                                <img
                                    src="${item.image}"
                                    alt="${item.title}"
                                >
                            `

                            : `
                                <span>
                                    ${item.emoji}
                                </span>
                            `
                        }

                    </div>


                    <div class="sell-cart-item-info">

                        <strong>
                            ${item.title}
                        </strong>

                        <small>
    ${formatCurrency(Number(item.price))}
    ×
    ${item.quantity}
</small>

                    </div>


                    <strong class="sell-cart-item-total">
    ${formatCurrency(lineTotal)}
</strong>

                </div>

            `;

        }).join('');


    updateSellTotals();


    console.log(
        'BRICK SELL 6 — Current sale rendered:',
        currentSaleItems
    );

}


// =========================================
// BRICK SELL 7 — CALCULATE SELL TOTALS
// =========================================

function updateSellTotals() {

    // =====================================
    // CALCULATE ITEMS
    // =====================================

    const totalItems =
        currentSaleItems.reduce(
            (total, item) => {

                return total +
                    Number(item.quantity || 0);

            },
            0
        );


    // =====================================
    // CALCULATE SUBTOTAL
    // =====================================

    const subtotal =
        currentSaleItems.reduce(
            (total, item) => {

                const price =
                    Number(item.price || 0);

                const quantity =
                    Number(item.quantity || 0);

                return total +
                    (price * quantity);

            },
            0
        );


    // =====================================
    // DISCOUNT
    // =====================================

    const discount =
        Number(sellDiscountAmount || 0);


    // =====================================
    // TAX
    // =====================================

    const tax =
        Number(sellTaxAmount || 0);


    // =====================================
    // GRAND TOTAL
    // =====================================

    const grandTotal =
        Math.max(
            0,
            subtotal -
            discount +
            tax
        );


    // =====================================
    // UPDATE ITEMS
    // =====================================

    if (sellTotalItems) {

        sellTotalItems.textContent =
            totalItems;

    }


    // =====================================
    // UPDATE SUBTOTAL
    // =====================================

    if (sellSubtotal) {

        sellSubtotal.textContent =
    formatCurrency(subtotal);

    }


    // =====================================
    // UPDATE DISCOUNT
    // =====================================

    if (sellDiscount) {

        sellDiscount.textContent =
    formatCurrency(discount);

    }


    // =====================================
    // UPDATE TAX
    // =====================================

    if (sellTax) {

        sellTax.textContent =
    formatCurrency(tax);

    }


    // =====================================
    // UPDATE GRAND TOTAL
    // =====================================

    if (sellGrandTotal) {

        sellGrandTotal.textContent =
    formatCurrency(grandTotal);

    }


    // =====================================
    // UPDATE PAY BUTTON
    // =====================================

    if (sellPayAmount) {

        sellPayAmount.textContent =
    formatCurrency(grandTotal);

    }


    // =====================================
    // DEBUG
    // =====================================

    console.log(
        'BRICK SELL 7 — Sell totals updated:',
        {
            items: totalItems,
            subtotal: subtotal,
            discount: discount,
            tax: tax,
            total: grandTotal
        }
    );

}


// =========================================
// BRICK SELL 8 — PAY / COMPLETE SALE
// =========================================

if (sellPayBtn) {

    sellPayBtn.addEventListener(
        'click',
        async () => {

            // =====================================
            // CHECK CURRENT SALE
            // =====================================

            if (
                !currentSaleItems ||
                currentSaleItems.length === 0
            ) {

                alert(
                    'Please add at least one product to the sale.'
                );

                return;
            }


            // =====================================
            // CALCULATE SALE TOTALS
            // =====================================

            const totalItems =
                currentSaleItems.reduce(
                    (total, item) => {

                        return total +
                            Number(
                                item.quantity || 0
                            );

                    },
                    0
                );


            const subtotal =
                currentSaleItems.reduce(
                    (total, item) => {

                        return total +
                            (
                                Number(
                                    item.price || 0
                                ) *
                                Number(
                                    item.quantity || 0
                                )
                            );

                    },
                    0
                );


            const discount =
                Number(
                    sellDiscountAmount || 0
                );


            const tax =
                Number(
                    sellTaxAmount || 0
                );


            const grandTotal =
                Math.max(
                    0,
                    subtotal -
                    discount +
                    tax
                );


            // =====================================
            // CONFIRM SALE
            // =====================================

            const confirmed =
                confirm(
                    `Complete this sale?\n\n` +
                    `Items: ${totalItems}\n` +
                    `Total: ${formatCurrency(grandTotal)}`
                );


            if (!confirmed) {

                return;

            }


            // =====================================
            // GET CUSTOMER
            // =====================================

            const customerName =
                document.getElementById(
                    'sellCustomerName'
                )?.textContent?.trim()
                || 'Walk-in Customer';


          // =========================================
// BRICK 1F — OFFLINE SALE COMPLETION
// =========================================

if (!navigator.onLine) {

    const offlineSale = {
        localSaleId:
            `offline_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 10)}`,

        userId:
            odropBarcodeCacheUserId || null,

        createdAt:
            new Date().toISOString(),

        items:
            currentSaleItems.map(item => ({
                ...item
            })),

        itemsCount:
            totalItems,

        subtotal:
            subtotal,

        discount:
            discount,

        tax:
            tax,

        total:
            grandTotal,

        customerName:
            customerName,

        note:
            '',

        paymentMethod:
            'cash',

        syncStatus:
            'pending'
    };


    // Add sale to local offline queue.
    odropOfflineSalesQueue.push(
        offlineSale
    );


    // Save queue immediately.
    saveOdropOfflineSalesQueue();


    console.log(
        'BRICK 1F — Sale saved offline:',
        offlineSale
    );


    // Clear current sale.
    currentSaleItems = [];

    sellDiscountAmount = 0;

    sellTaxAmount = 0;


    // Refresh POS display.
    renderSellCart();

    updateSellTotals();


    if (sellPayBtn) {
        sellPayBtn.disabled = false;
    }


    alert(
        'Sale completed offline.\n\n' +
        'The sale has been safely saved on this device ' +
        'and will be synchronized when you are back online.'
    );


    return;
}

            // =====================================
            // GET AUTHENTICATED USER
            // =====================================

            const {
                data: {
                    user
                },
                error: userError
            } =
                await supabaseClient.auth.getUser();


            if (userError || !user) {

                console.error(
                    'BRICK SELL 8 — Authentication failed:',
                    userError
                );

                alert(
                    'Your session has expired. Please sign in again.'
                );

                return;

            }


            console.log(
                'BRICK SELL 8 — Completing sale:',
                {
                    userId: user.id,
                    items: currentSaleItems,
                    totalItems: totalItems,
                    subtotal: subtotal,
                    discount: discount,
                    tax: tax,
                    total: grandTotal
                }
            );


            // =====================================
            // PREVENT DOUBLE CLICK
            // =====================================

            sellPayBtn.disabled = true;


            try {

                // =================================
                // COMPLETE SALE IN SUPABASE
                // =================================

                const {
                    data: saleId,
                    error: saleError
                } =
                    await supabaseClient.rpc(
                        'complete_sale',
                        {

                            p_items:
                                currentSaleItems,

                            p_items_count:
                                totalItems,

                            p_subtotal:
                                subtotal,

                            p_discount:
                                discount,

                            p_tax:
                                tax,

                            p_total:
                                grandTotal,

                            p_customer_name:
                                customerName,

                            p_note:
                                '',

                            p_payment_method:
                                'cash'

                        }
                    );


                if (saleError) {

                    console.error(
                        'BRICK SELL 8 — Sale failed:',
                        saleError
                    );

                    alert(
                        'The sale could not be completed.\n\n' +
                        saleError.message
                    );

                    return;

                }


                console.log(
    'BRICK SELL 8 — Sale completed successfully:',
    saleId
);


// =========================================
// BRICK INBOX 6 — SALE COMPLETED NOTIFICATION
// =========================================

try {

    await createNotification({

        type:
            'sale',

        title:
            'Sale completed',

        message:
            `A sale of ${formatCurrency(Number(grandTotal))} was completed successfully.`,

        icon:
            'fa-solid fa-circle-check'

    });


    console.log(
        'BRICK INBOX 6 — Sale notification created.'
    );

} catch (notificationError) {

    console.error(
        'BRICK INBOX 6 — Notification failed:',
        notificationError
    );

}


// =========================================
// REFRESH TODAY'S SALES SUMMARY
// =========================================

await loadSellTodaySummary();


                // =================================
                // CLEAR CURRENT SALE
                // =================================

                currentSaleItems = [];

                sellDiscountAmount = 0;

                sellTaxAmount = 0;


                // =================================
                // REFRESH SELL PRODUCTS
                // =================================

                await renderProducts();


                await syncSellProducts();


                // =================================
                // REFRESH CURRENT SALE
                // =================================

                renderSellCart();

                updateSellTotals();


                // =================================
                // SUCCESS
                // =================================

                alert(
                    `Sale completed successfully!\n\n` +
                    `Items sold: ${totalItems}\n` +
                    `Revenue: ${formatCurrency(grandTotal)}`
                );


                console.log(
                    'BRICK SELL 8 — POS sale finished.'
                );

            } catch (error) {

                console.error(
                    'BRICK SELL 8 — Unexpected sale error:',
                    error
                );

                alert(
                    'An unexpected error occurred while completing the sale.\n\n' +
                    (error?.message || error)
                );

            } finally {

                sellPayBtn.disabled = false;

            }

        }
    );

}


/* =========================================
   BRICK 3 — SALES PERIOD DATE BOUNDARIES
   Date calculation only; no sales queries.
========================================= */

function getSalesPeriodRange(period, now = new Date()) {

    // Use local calendar dates for the seller's device.
    const today = new Date(now);

    today.setHours(0, 0, 0, 0);

    // Exclusive end boundary: midnight tomorrow.
    const endDate = new Date(today);

    endDate.setDate(endDate.getDate() + 1);

    // All time has no lower or upper date restriction.
    if (period === 'all') {
        return {
            startDate: null,
            endDate: null
        };
    }

    // Custom range will be handled in Brick 7.
    if (period === 'custom') {
        return {
            startDate: null,
            endDate: null
        };
    }

    let startDate = new Date(today);

    if (period === 'today') {
        // Start at midnight today.
    }

    else if (period === 'week') {
        // Monday is the first day of the week.
        const day = startDate.getDay();

        const daysSinceMonday = (day + 6) % 7;

        startDate.setDate(
            startDate.getDate() - daysSinceMonday
        );
    }

    else if (period === 'month') {
        startDate.setDate(1);
    }

    else if (
        period === 'last3' ||
        period === 'last6' ||
        period === 'last12'
    ) {
        const monthsBack = {
            last3: 3,
            last6: 6,
            last12: 12
        }[period];

        const originalDay = startDate.getDate();

        // Move to the first day to avoid month overflow.
        startDate.setDate(1);

        startDate.setMonth(
            startDate.getMonth() - monthsBack
        );

        // Restore the day, clamping to the target month's
        // final day when necessary.
        const lastDayOfTargetMonth = new Date(
            startDate.getFullYear(),
            startDate.getMonth() + 1,
            0
        ).getDate();

        startDate.setDate(
            Math.min(originalDay, lastDayOfTargetMonth)
        );
    }

    else if (period === 'year') {
        startDate = new Date(
            today.getFullYear(),
            0,
            1
        );
    }

    else {
        console.warn(
            'BRICK 3 — Unknown sales period:',
            period
        );

        return null;
    }

    return {
        startDate,
        endDate
    };
}

// =========================================
// GLOBAL SALES DATA LOADER
// =========================================
async function loadSellerSales(period = 'month') {

    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        console.error(
            'SALES LOADER — User not found:',
            userError
        );
        return [];
    }

    // Custom range will be implemented in Brick 7.
    if (period === 'custom') {
        console.warn(
            'SALES LOADER — Custom range is not implemented yet.'
        );
        return [];
    }

    // Use Brick 3 to calculate the selected period.
    const range = getSalesPeriodRange(period);

    if (!range) {
        console.error(
            'SALES LOADER — Invalid sales period:',
            period
        );
        return [];
    }

    let query = supabaseClient
        .from('sales')
        .select(`
            id,
            items_count,
            total,
            created_at
        `)
        .eq('owner_id', user.id);

    // All time has no date restrictions.
    if (range.startDate) {
        query = query.gte(
            'created_at',
            range.startDate.toISOString()
        );
    }

    // Exclude tomorrow and all future dates for bounded periods.
    if (range.endDate) {
        query = query.lt(
            'created_at',
            range.endDate.toISOString()
        );
    }

    const {
        data,
        error
    } = await query.order(
        'created_at',
        {
            ascending: false
        }
    );

    if (error) {
        console.error(
            'SALES LOADER ERROR:',
            error
        );
        return [];
    }

    console.log(
        'SALES LOADER — Period:',
        period,
        '| Loaded sales:',
        data
    );

    return data || [];
}

updateStoreSalesCard();

// =========================================
// BRICK STORE SALES 1 — STORE SALES CARD
// =========================================

async function updateStoreSalesCard() {

    console.log(
        'BRICK STORE SALES 1 — Updating store sales card...'
    );


    const salesElement =
        document.getElementById(
            'overviewSales'
        );

    const statusElement =
        document.getElementById(
            'salesStatus'
        );


    if (!salesElement) {

        console.error(
            'BRICK STORE SALES 1 — overviewSales not found.'
        );

        return;
    }

// =====================================
// LOAD SELECTED PERIOD SALES
// =====================================

const period =
    window.nexodraSelectedSalesPeriod || 'month';

const sales =
    await loadSellerSales(period);

    // =====================================
    // CALCULATE MONTHLY REVENUE
    // =====================================

    const revenue =
        (sales || []).reduce(
            (total, sale) => {

                return total +
                    Number(
                        sale.total || 0
                    );

            },
            0
        );


    // =====================================
    // UPDATE SALES CARD
    // =====================================

    salesElement.textContent =
    formatCurrency(revenue);


    if (statusElement) {

        if (sales && sales.length > 0) {

const periodLabels = {
    today: 'today',
    week: 'this week',
    month: 'this month',
    last3: 'in the last 3 months',
    last6: 'in the last 6 months',
    year: 'this year',
    last12: 'in the last 12 months',
    all: 'in total'
};

statusElement.textContent =
    `${sales.length} sale${sales.length === 1 ? '' : 's'} ${periodLabels[period] || 'in this period'}`;


        } else {

            statusElement.textContent =
                'No sales yet';

        }

    }


    console.log(
        'BRICK STORE SALES 1 — Store sales card updated:',
        {
            revenue: revenue,
            transactions: sales
                ? sales.length
                : 0
        }
    );

}

// =========================================
// BRICK SALES OVERVIEW 2 — SUMMARY CARDS
// =========================================

async function loadSalesOverview() {

    console.log(
        'SALES OVERVIEW FUNCTION STARTED'
    );


    // =====================================
    // LOAD MONTHLY SALES
    // =====================================

    const sales =
        await loadSellerSales('month');


    console.log(
        'SALES OVERVIEW — Sales loaded:',
        sales
    );


    // =====================================
    // CALCULATE SUMMARY
    // =====================================

    const transactions =
        sales.length;


    const itemsSold =
        sales.reduce(
            (total, sale) => {

                return total +
                    Number(
                        sale.items_count || 0
                    );

            },
            0
        );


    const revenue =
        sales.reduce(
            (total, sale) => {

                return total +
                    Number(
                        sale.total || 0
                    );

            },
            0
        );


    // =====================================
    // FIND SALES OVERVIEW ELEMENTS
    // =====================================

    const revenueElement =
        document.getElementById(
            'analyticsRevenue'
        );


    const transactionsElement =
        document.getElementById(
            'analyticsTransactions'
        );


    const itemsElement =
        document.getElementById(
            'analyticsItemsSold'
        );


    const graphTotalElement =
        document.getElementById(
            'analyticsGraphTotal'
        );


    // =====================================
    // UPDATE REVENUE
    // =====================================

    if (revenueElement) {

        revenueElement.textContent =
    formatCurrency(revenue);

    }


    // =====================================
    // UPDATE TRANSACTIONS
    // =====================================

    if (transactionsElement) {

        transactionsElement.textContent =
            transactions;

    }


    // =====================================
    // UPDATE ITEMS SOLD
    // =====================================

    if (itemsElement) {

        itemsElement.textContent =
            itemsSold;

    }


    // =====================================
    // UPDATE GRAPH TOTAL
    // =====================================

    if (graphTotalElement) {

        graphTotalElement.textContent =
    formatCurrency(revenue);

    }


    // =====================================
    // DEBUG
    // =====================================

    console.log(
        'SALES OVERVIEW — Summary calculated:',
        {
            revenue: revenue,
            transactions: transactions,
            itemsSold: itemsSold
        }
    );

  renderSalesHistory(sales);

/* =========================================================
   BRICK 2 — CONNECT REAL SALES TO REVENUE CHART
   ========================================================= */

console.log(
  'BRICK 2 — Updating Revenue chart with Supabase sales:',
  sales.length
);

try {

  const revenueCanvas =
    document.getElementById('revenueChart');

  if (revenueCanvas) {

    const chartData =
      prepareRevenueChartData(sales, '30d');

    console.log(
      'BRICK 2 — Prepared Revenue chart data:',
      chartData
    );

    updateRevenueChart(
      revenueCanvas,
      chartData
    );

    // Update the Total Revenue display using real sales.
const totalRevenueDisplay = document.querySelector(
  "#totalRevenueDisplay"
);

if (totalRevenueDisplay) {
  const totalRevenue = (sales || []).reduce((total, sale) => {
    return total + (Number(sale.total) || 0);
  }, 0);

  totalRevenueDisplay.innerHTML = `
    <span>$</span>${Math.floor(totalRevenue).toLocaleString("en-US")}
    <span class="revenue-decimal">.${(totalRevenue % 1)
      .toFixed(2)
      .slice(2)}</span>
  `;

  console.log("BRICK 6 — Total Revenue updated:", totalRevenue);
}

  } else {

    console.warn(
      'BRICK 2 — Revenue chart canvas not found.'
    );

  }

} catch (error) {

  console.error(
    'BRICK 2 — Revenue chart update failed:',
    error
  );

}


}



// =========================================
// BRICK SALES OVERVIEW 3 — SALES HISTORY
// =========================================

function renderSalesHistory(sales) {

    const salesHistoryList =
        document.getElementById(
            'salesHistoryList'
        );


    if (!salesHistoryList) {

        console.error(
            'SALES OVERVIEW 3 — salesHistoryList not found.'
        );

        return;
    }    

  
    // =====================================
    // NO SALES
    // =====================================

    if (!sales || sales.length === 0) {

        salesHistoryList.innerHTML = `

            <div class="sales-history-empty">

                <i class="fa-solid fa-receipt"></i>

                <strong>
                    No sales yet
                </strong>

                <span>
                    Completed sales will appear here.
                </span>

            </div>

        `;

        console.log(
            'SALES OVERVIEW 3 — No sales to display.'
        );

        return;
    }


    // =====================================
    // RENDER SALES
    // =====================================

    salesHistoryList.innerHTML =
        sales.map(sale => {

            const saleTotal =
                Number(
                    sale.total || 0
                );


            const itemsCount =
                Number(
                    sale.items_count || 0
                );


            const saleDate =
                new Date(
                    sale.created_at
                );


            const formattedDate =
                saleDate.toLocaleDateString(
                    undefined,
                    {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    }
                );


            const formattedTime =
                saleDate.toLocaleTimeString(
                    undefined,
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );


            return `

                <div
                    class="sales-history-item"
                    data-sale-id="${sale.id}"
                >

                    <div class="sales-history-icon">

                        <i class="fa-solid fa-receipt"></i>

                    </div>


                    <div class="sales-history-info">

                        <strong>
                            Sale #${String(sale.id).slice(0, 8)}
                        </strong>

                        <span>
                            ${formattedDate}
                            ·
                            ${formattedTime}
                        </span>

                        <small>
                            ${itemsCount}
                            ${
                                itemsCount === 1
                                    ? 'item'
                                    : 'items'
                            }
                        </small>

                    </div>


                    <strong class="sales-history-total">
    ${formatCurrency(saleTotal)}
</strong>

                </div>

            `;

        }).join('');


    console.log(
        'SALES OVERVIEW 3 — Sales history rendered:',
        sales.length
    );

}


// =========================================
// BRICK SALES OVERVIEW 4 — REVENUE LINE GRAPH
// =========================================

function renderSalesGraph(sales) {

    console.log(
        'SALES OVERVIEW 4 — GRAPH FUNCTION STARTED',
        sales
    );


    const graphContainer =
        document.getElementById(
            'salesGraph'
        );


    if (!graphContainer) {

        console.error(
            'SALES OVERVIEW 4 — salesGraph not found.'
        );

        return;
    }


    // =====================================
    // PREPARE 7 DAYS
    // =====================================

    const days = [];

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date(today);

        date.setDate(
            today.getDate() - i
        );


        days.push({
            date: date,
            label: date.toLocaleDateString(
                'en-US',
                {
                    weekday: 'short'
                }
            ),
            revenue: 0
        });

    }


    // =====================================
    // ADD SALES TO EACH DAY
    // =====================================

    (sales || []).forEach(
        sale => {

            const saleDate =
                new Date(
                    sale.created_at
                );


            const saleDay =
                saleDate.toDateString();


            const matchingDay =
                days.find(
                    day =>
                        day.date.toDateString() ===
                        saleDay
                );


            if (matchingDay) {

                matchingDay.revenue +=
                    Number(
                        sale.total || 0
                    );

            }

        }
    );


    // =====================================
    // FIND MAX REVENUE
    // =====================================

    const maxRevenue =
        Math.max(
            ...days.map(
                day =>
                    day.revenue
            ),
            0
        );


    const graphMax =
        maxRevenue > 0
            ? maxRevenue
            : 1;


    // =====================================
    // GRAPH DIMENSIONS
    // =====================================

    const width = 700;
    const height = 260;

    const paddingLeft = 20;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 45;


    const chartWidth =
        width -
        paddingLeft -
        paddingRight;


    const chartHeight =
        height -
        paddingTop -
        paddingBottom;


    // =====================================
    // CREATE POINTS
    // =====================================

    const points =
        days.map(
            (day, index) => {

                const x =
                    paddingLeft +
                    (
                        index /
                        (days.length - 1)
                    ) *
                    chartWidth;


                const y =
                    paddingTop +
                    chartHeight -
                    (
                        day.revenue /
                        graphMax
                    ) *
                    chartHeight;


                return {
                    x: x,
                    y: y,
                    revenue:
                        day.revenue,
                    label:
                        day.label
                };

            }
        );


        // =====================================
    // SMOOTH LINE PATH
    // =====================================

    let linePath = '';

    points.forEach(
        (point, index) => {

            if (index === 0) {

                linePath +=
                    `M ${point.x} ${point.y}`;

                return;

            }


            const previous =
                points[index - 1];


            const controlX =
                (
                    previous.x +
                    point.x
                ) / 2;


            linePath +=
                ` C ${controlX} ${previous.y},
                  ${controlX} ${point.y},
                  ${point.x} ${point.y}`;

        }
    );


    // =====================================
    // SMOOTH AREA UNDER LINE
    // =====================================

    const areaPath =
        linePath +
        ` L ${points[points.length - 1].x} ${height - paddingBottom}` +
        ` L ${points[0].x} ${height - paddingBottom}` +
        ` Z`;


    // =====================================
    // DAY LABELS
    // =====================================

    const labels =
        points.map(
            point => {

                return `
                    <text
                        x="${point.x}"
                        y="${height - 12}"
                        text-anchor="middle"
                        class="sales-graph-day"
                    >
                        ${point.label}
                    </text>
                `;

            }
        ).join('');


    // =====================================
    // DATA POINTS
    // =====================================

    const circles =
        points.map(
            point => {

                return `
                    <circle
                        cx="${point.x}"
                        cy="${point.y}"
                        r="5"
                        class="sales-graph-point"
                    >
                        <title>
    ${point.label}: ${formatCurrency(point.revenue)}
</title>
                    </circle>
                `;

            }
        ).join('');


    // =====================================
    // DRAW GRAPH
    // =====================================

    graphContainer.innerHTML = `

        <div class="sales-line-chart">

            <svg
                class="sales-line-chart-svg"
                viewBox="0 0 ${width} ${height}"
                preserveAspectRatio="none"
                role="img"
                aria-label="Sales revenue for the last seven days"
            >

                <!-- Area -->

              <path
               d="${areaPath}"
              class="sales-graph-area"
               ></path>


                <!-- Baseline -->

                <line
                    x1="${paddingLeft}"
                    y1="${height - paddingBottom}"
                    x2="${width - paddingRight}"
                    y2="${height - paddingBottom}"
                    class="sales-graph-baseline"
                ></line>


                <!-- Revenue line -->

                     <path
                       d="${linePath}"
                    class="sales-graph-line"
                     fill="none"
                      ></path>


                <!-- Day labels -->

                ${labels}

            </svg>

        </div>

    `;


    console.log(
        'SALES OVERVIEW 4 — Revenue line graph rendered:',
        days
    );

}


// =========================================
// BRICK SELL 10 — TODAY'S SALES SUMMARY
// =========================================

async function loadSellTodaySummary() {

    const revenueElement =
        document.getElementById(
            'sellTodayRevenue'
        );


    const transactionsElement =
        document.getElementById(
            'sellTodayTransactions'
        );


    const itemsElement =
        document.getElementById(
            'sellTodayItems'
        );


    if (
        !revenueElement ||
        !transactionsElement ||
        !itemsElement
    ) {

        return;

    }


    // =====================================
    // GET AUTHENTICATED USER
    // =====================================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            'BRICK SELL 10 — Could not get user:',
            userError
        );

        return;

    }


    // =====================================
    // GET START OF TODAY
    // =====================================

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const tomorrow =
        new Date(today);


    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const todayStart =
        today.toISOString();


    const tomorrowStart =
        tomorrow.toISOString();


    // =====================================
    // LOAD TODAY'S SALES
    // =====================================

    const {
        data: sales,
        error: salesError
    } =
        await supabaseClient
            .from('sales')
            .select(
                'id, items_count, total, created_at'
            )
            .eq(
                'owner_id',
                user.id
            )
            .gte(
                'created_at',
                todayStart
            )
            .lt(
                'created_at',
                tomorrowStart
            );


    if (salesError) {

        console.error(
            'BRICK SELL 10 — Could not load today sales:',
            salesError
        );

        return;

    }


    // =====================================
    // CALCULATE SUMMARY
    // =====================================

    const transactions =
        sales.length;


    const itemsSold =
        sales.reduce(
            (total, sale) => {

                return total +
                    Number(
                        sale.items_count || 0
                    );

            },
            0
        );


    const revenue =
        sales.reduce(
            (total, sale) => {

                return total +
                    Number(
                        sale.total || 0
                    );

            },
            0
        );


    // =====================================
    // UPDATE UI
    // =====================================

    revenueElement.textContent =
    formatCurrency(revenue);


    transactionsElement.textContent =
        transactions;


    itemsElement.textContent =
        itemsSold;


    console.log(
        'BRICK SELL 10 — Today summary:',
        {
            revenue: revenue,
            transactions: transactions,
            itemsSold: itemsSold
        }
    );

}


// =========================================
// LOAD TODAY'S SELL SUMMARY
// =========================================

loadSellTodaySummary();

  
// =========================================
// BRICK SELL 3 — SYNC PRODUCTS TO SELL PAGE
// =========================================

function syncSellProducts() {

    sellProducts =
        products.map(product => ({
            ...product
        }));


    console.log(
        'BRICK SELL 3 — Sell products synced:',
        sellProducts
    );


    renderSellProducts();

}

// =========================================
// PRODUCT DATA
// =========================================

let products = [];

let publicProducts = [];


// =========================================
// BRICK S2-A — BARCODE CACHE FOUNDATION
// =========================================

let odropBarcodeCache = {};

let odropBarcodeCacheUserId = null;

const ODROP_BARCODE_CACHE_PREFIX =
    'odropBarcodeCacheV1:';


// -----------------------------------------
// NORMALIZE BARCODE
// -----------------------------------------

function normalizeOdropBarcode(value) {

    return String(value || '')
        .trim()
        .replace(/\s+/g, '');

}


// -----------------------------------------
// GET USER-SCOPED CACHE KEY
// -----------------------------------------

function getOdropBarcodeCacheKey(userId) {

    return (
        ODROP_BARCODE_CACHE_PREFIX +
        String(userId)
    );

}


// -----------------------------------------
// BUILD LIGHTWEIGHT BARCODE CACHE
// -----------------------------------------

function buildOdropBarcodeCache(
    sourceProducts
) {

    const cache = {};

    (sourceProducts || []).forEach(
        product => {

            const barcode =
                normalizeOdropBarcode(
                    product?.barcode
                );

            // Products without a barcode
            // do not enter the barcode index.
            if (!barcode) {
                return;
            }

            cache[barcode] = {
                id:
                    product.id,

                barcode:
                    barcode,

                title:
                    product.title || '',

                price:
                    Number(product.price || 0),

                stock:
                    Number(product.stock || 0),

                category:
                    product.category || ''
            };

        }
    );

    return cache;

}


// -----------------------------------------
// SAVE BARCODE CACHE
// -----------------------------------------

function saveOdropBarcodeCache(
    userId,
    cache
) {

    if (!userId) {
        return;
    }

    try {

        localStorage.setItem(
            getOdropBarcodeCacheKey(userId),
            JSON.stringify(cache)
        );

        console.log(
            'BRICK S2-A — Barcode cache saved:',
            Object.keys(cache).length,
            'products'
        );

    } catch (error) {

        console.error(
            'BRICK S2-A — Could not save barcode cache:',
            error
        );

    }

}


// -----------------------------------------
// LOAD BARCODE CACHE
// -----------------------------------------

function loadOdropBarcodeCache(
    userId
) {

    if (!userId) {
        return {};
    }

    try {

        const savedCache =
            localStorage.getItem(
                getOdropBarcodeCacheKey(userId)
            );

        if (!savedCache) {

            console.log(
                'BRICK S2-A — No barcode cache found.'
            );

            return {};

        }

        const parsedCache =
            JSON.parse(savedCache);

        if (
            !parsedCache ||
            typeof parsedCache !== 'object'
        ) {

            return {};

        }

        console.log(
            'BRICK S2-A — Barcode cache loaded:',
            Object.keys(parsedCache).length,
            'products'
        );

        return parsedCache;

    } catch (error) {

        console.error(
            'BRICK S2-A — Could not load barcode cache:',
            error
        );

        return {};

    }

}


// -----------------------------------------
// SYNC BARCODE CACHE FROM PRODUCTS
// -----------------------------------------

function syncOdropBarcodeCache(
    sourceProducts,
    userId
) {

    if (!userId) {

        console.warn(
            'BRICK S2-A — Cannot sync barcode cache without user.'
        );

        return;

    }

    odropBarcodeCacheUserId =
        String(userId);

    odropBarcodeCache =
        buildOdropBarcodeCache(
            sourceProducts
        );

    saveOdropBarcodeCache(
        userId,
        odropBarcodeCache
    );

    console.log(
        'BRICK S2-A — Barcode cache synchronized:',
        {
            userId:
                userId,

            productCount:
                (sourceProducts || []).length,

            barcodeCount:
                Object.keys(
                    odropBarcodeCache
                ).length
        }
    );

}


// -----------------------------------------
// FIND PRODUCT IN BARCODE CACHE
// -----------------------------------------

function getOdropCachedProductByBarcode(
    barcode
) {

    const normalizedBarcode =
        normalizeOdropBarcode(
            barcode
        );

    if (!normalizedBarcode) {
        return null;
    }

    return (
        odropBarcodeCache[
            normalizedBarcode
        ] || null
    );

}

// =========================================
// PUBLIC STORE IDENTITY
// =========================================

let currentStoreOwnerId = null;
let currentPublicStoreSlug = '';

let isStorePreviewMode = false;

// Compress product images before saving them
function compressProductImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                
                // Resize large images
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedImage = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedImage);
            };
            img.onerror = () => {
                reject(new Error('Could not load image'));
            };
            img.src = event.target.result;
        };
        reader.onerror = () => {
            reject(new Error('Could not read image'));
        };
        reader.readAsDataURL(file);
    });
}

// =========================================
// CALCULATOR NAVIGATION
// BRICK CALC 3
// =========================================

// CALCULATOR VISIBILITY FIX
const calculatorScreen = document.getElementById('calculatorScreen');

if (calculatorScreen) {
    calculatorScreen.hidden = true;
    calculatorScreen.classList.remove('active');
    calculatorScreen.style.display = 'none';
}


const calculatorBackBtn =
    document.getElementById(
        'calculatorBackBtn'
    );


// =========================================
// OPEN CALCULATOR
// =========================================

const calculatorBtn =
    document.getElementById(
        'calculatorBtn'
    );


if (calculatorBtn) {

    calculatorBtn.addEventListener(
        'click',
        () => {

            if (!calculatorScreen) {

                console.error(
                    'BRICK CALC 3 — Calculator screen not found.'
                );

                return;

            }


            // Hide all normal screens

            screens.forEach(screen => {

                screen.classList.remove(
                    'active'
                );

            });

             // Show calculator
calculatorScreen.hidden = false;
calculatorScreen.style.display = '';
calculatorScreen.classList.add('active');

calculatorScreen.scrollTop = 0;
window.scrollTo({ top: 0, behavior: 'auto' }); 

            // Remove bottom-nav active state

            navButtons.forEach(button => {

                button.classList.remove(
                    'active'
                );

            });


            if (screenTitle) {

                screenTitle.textContent =
                    'Calculator';

            }


            console.log(
                'BRICK CALC 3 — Calculator opened.'
            );

        }
    );

}


// =========================================
// BACK TO STORE
// =========================================

if (calculatorBackBtn) {

    calculatorBackBtn.addEventListener(
        'click',
        () => {

            if (!calculatorScreen) {
                return;
            }


            // Hide calculator

            calculatorScreen.classList.remove(
                'active'
            );


            // Hide all screens first

            screens.forEach(screen => {

                screen.classList.remove(
                    'active'
                );

            });


            // Show Store

            const storeScreen =
                document.getElementById(
                    'storeScreen'
                );


            if (storeScreen) {

                storeScreen.classList.add(
                    'active'
                );

            }


            // Restore Store navigation

            navButtons.forEach(button => {

                button.classList.remove(
                    'active'
                );

            });


            const storeNav =
                document.querySelector(
                    '.nav-btn[data-target="storeScreen"]'
                );


            if (storeNav) {

                storeNav.classList.add(
                    'active'
                );

            }


            if (screenTitle) {

                screenTitle.textContent =
                    'Store';

            }


            console.log(
                'BRICK CALC 3 — Returned to Store.'
            );

        }
    );

}

// =========================================
// CALCULATOR LOGIC
// BRICK CALC 4
// =========================================

const calculatorExpression =
    document.getElementById(
        'calculatorExpression'
    );

const calculatorResult =
    document.getElementById(
        'calculatorResult'
    );

const calculatorKeys =
    document.querySelectorAll(
        '.calculator-key'
    );


let calculatorCurrentValue = '0';
let calculatorStoredValue = null;
let calculatorOperator = null;
let calculatorWaitingForValue = false;
let calculatorJustCalculated = false;


// =========================================
// UPDATE DISPLAY
// =========================================

function updateCalculatorDisplay() {

    if (calculatorExpression) {

        calculatorExpression.textContent =
            calculatorOperator
                ? `${calculatorStoredValue ?? calculatorCurrentValue} ${calculatorOperator}`
                : calculatorCurrentValue;

    }


    if (calculatorResult) {

        calculatorResult.textContent =
            calculatorCurrentValue;

    }

}


// =========================================
// INPUT NUMBER
// =========================================

function calculatorInputNumber(value) {

    if (calculatorWaitingForValue || calculatorJustCalculated) {

        calculatorCurrentValue =
            value === '.'
                ? '0.'
                : value;

        calculatorWaitingForValue = false;
        calculatorJustCalculated = false;

        updateCalculatorDisplay();

        return;

    }


    if (value === '.') {

        if (
            calculatorCurrentValue
                .includes('.')
        ) {
            return;
        }

        calculatorCurrentValue += '.';

    } else {

        if (
            calculatorCurrentValue === '0'
        ) {

            calculatorCurrentValue =
                value;

        } else {

            calculatorCurrentValue += value;

        }

    }


    updateCalculatorDisplay();

}


// =========================================
// CHOOSE OPERATOR
// =========================================

function calculatorChooseOperator(
    operator
) {

    const current =
        Number(
            calculatorCurrentValue
        );


    if (
        calculatorStoredValue !== null &&
        calculatorOperator &&
        !calculatorWaitingForValue
    ) {

        const result =
            calculateCalculatorResult(
                calculatorStoredValue,
                current,
                calculatorOperator
            );

        calculatorStoredValue =
            result;

        calculatorCurrentValue =
            String(result);

    } else {

        calculatorStoredValue =
            current;

    }


    calculatorOperator =
        operator;

    calculatorWaitingForValue =
        true;

    calculatorJustCalculated =
        false;

    updateCalculatorDisplay();

}


// =========================================
// CALCULATE
// =========================================

function calculateCalculatorResult(
    first,
    second,
    operator
) {

    switch (operator) {

        case '+':
            return first + second;

        case '-':
            return first - second;

        case '*':
            return first * second;

        case '/':
            if (second === 0) {
                return null;
            }

            return first / second;

        default:
            return second;

    }

}


// =========================================
// EQUALS
// =========================================

function calculatorEquals() {

    if (
        calculatorStoredValue === null ||
        !calculatorOperator
    ) {
        return;
    }


    const first =
        Number(
            calculatorStoredValue
        );

    const second =
        Number(
            calculatorCurrentValue
        );


    const result =
        calculateCalculatorResult(
            first,
            second,
            calculatorOperator
        );


    if (result === null) {

        calculatorCurrentValue =
            'Error';

        calculatorStoredValue =
            null;

        calculatorOperator =
            null;

        calculatorWaitingForValue =
            true;

        calculatorJustCalculated =
            true;

        updateCalculatorDisplay();

        return;

    }


    calculatorCurrentValue =
        String(result);

    calculatorStoredValue =
        null;

    calculatorOperator =
        null;

    calculatorWaitingForValue =
        false;

    calculatorJustCalculated =
        true;

    updateCalculatorDisplay();

}


// =========================================
// CLEAR
// =========================================

function calculatorClear() {

    calculatorCurrentValue =
        '0';

    calculatorStoredValue =
        null;

    calculatorOperator =
        null;

    calculatorWaitingForValue =
        false;

    calculatorJustCalculated =
        false;

    updateCalculatorDisplay();

}


// =========================================
// DELETE LAST DIGIT
// =========================================

function calculatorDelete() {

    if (
        calculatorWaitingForValue ||
        calculatorJustCalculated
    ) {
        return;
    }


    if (
        calculatorCurrentValue.length <= 1
    ) {

        calculatorCurrentValue =
            '0';

    } else {

        calculatorCurrentValue =
            calculatorCurrentValue.slice(
                0,
                -1
            );

    }


    updateCalculatorDisplay();

}


// =========================================
// PERCENT
// =========================================

function calculatorPercent() {

    const value =
        Number(
            calculatorCurrentValue
        );


    if (!Number.isFinite(value)) {
        return;
    }


    calculatorCurrentValue =
        String(value / 100);

    updateCalculatorDisplay();

}


// =========================================
// BUTTON EVENTS
// =========================================

calculatorKeys.forEach(
    button => {

        button.addEventListener(
            'click',
            () => {

                const value =
                    button.getAttribute(
                        'data-calculator-value'
                    );

                const action =
                    button.getAttribute(
                        'data-calculator-action'
                    );


                if (value !== null) {

                    if (
                        value === '+' ||
                        value === '-' ||
                        value === '*' ||
                        value === '/'
                    ) {

                        calculatorChooseOperator(
                            value
                        );

                    } else {

                        calculatorInputNumber(
                            value
                        );

                    }

                    return;

                }


                switch (action) {

                    case 'clear':
                        calculatorClear();
                        break;

                    case 'delete':
                        calculatorDelete();
                        break;

                    case 'percent':
                        calculatorPercent();
                        break;

                    case 'equals':
                        calculatorEquals();
                        break;

                }

            }
        );

    }
);


// =========================================
// INITIAL DISPLAY
// =========================================

updateCalculatorDisplay();

// =========================================
// STORE QR SCREEN
// BRICK STORE QR 1
// =========================================

// =========================================
// STORE QR SCREEN
// BRICK STORE QR 1
// =========================================

const storeQrScreen =
    document.getElementById(
        'storeQrScreen'
    );


// =========================================
// STORE QR DOM RELOCATION
// BRICK STORE QR 2
// =========================================
//
// The Store QR screen was originally placed
// inside #publicStore.
//
// #publicStore uses:
// display: none;
//
// Therefore the QR screen becomes invisible
// even when .active is added.
//
// Move it into the seller app's .app-body.
// =========================================

const sellerAppBody =
    document.querySelector(
        '.app-container .app-body'
    );

if (
    storeQrScreen &&
    sellerAppBody
) {

    sellerAppBody.appendChild(
        storeQrScreen
    );

    console.log(
        'BRICK STORE QR 2 — Store QR moved into seller app body.'
    );

} else {

    console.error(
        'BRICK STORE QR 2 — Could not relocate Store QR screen.'
    );

}

// BRICK R5 — Move Reports out of hidden Sales Overview.
const reportsScreenR5 =
    document.getElementById('reportsScreen');

const appBodyR5 =
    document.querySelector('.app-container .app-body');

if (
    reportsScreenR5 &&
    appBodyR5 &&
    reportsScreenR5.parentElement !== appBodyR5
) {
    appBodyR5.appendChild(reportsScreenR5);

    console.log(
        'BRICK R5 — Reports moved into app-body.'
    );
} else {
    console.log(
        'BRICK R5 — Reports already in app-body or elements missing.'
    );
}

const storeQrBackBtn =
    document.getElementById(
        'storeQrBackBtn'
    );

const openStoreQrBtn =
    document.getElementById(
        'openStoreQrBtn'
    );


if (openStoreQrBtn) {

    openStoreQrBtn.addEventListener(
        'click',
        () => {

            if (!storeQrScreen) {

                console.error(
                    'BRICK STORE QR 1 — Store QR screen not found.'
                );

                return;

            }


            screens.forEach(
                screen => {

                    screen.classList.remove(
                        'active'
                    );

                }
            );


            storeQrScreen.classList.add(
                'active'
            );

          generateStoreQrCode();


            navButtons.forEach(
                button => {

                    button.classList.remove(
                        'active'
                    );

                }
            );


            if (screenTitle) {

                screenTitle.textContent =
                    'Store QR';

            }


            console.log(
                'BRICK STORE QR 1 — Store QR opened.'
            );

        }
    );

}


if (storeQrBackBtn) {

    storeQrBackBtn.addEventListener(
        'click',
        () => {

            if (!storeQrScreen) {
                return;
            }


            storeQrScreen.classList.remove(
                'active'
            );


            screens.forEach(
                screen => {

                    screen.classList.remove(
                        'active'
                    );

                }
            );


            const storeScreen =
                document.getElementById(
                    'storeScreen'
                );


            if (storeScreen) {

                storeScreen.classList.add(
                    'active'
                );

            }


            navButtons.forEach(
                button => {

                    button.classList.remove(
                        'active'
                    );

                }
            );


            const storeNav =
                document.querySelector(
                    '.nav-btn[data-target="storeScreen"]'
                );


            if (storeNav) {

                storeNav.classList.add(
                    'active'
                );

            }


            if (screenTitle) {

                screenTitle.textContent =
                    'Store';

            }


            console.log(
                'BRICK STORE QR 1 — Returned to Store.'
            );

        }
    );

}

// =========================================
// NAVIGATION
// =========================================
// BRICK C — PRESERVE OPEN SELLER CHAT
// =========================================

navButtons.forEach(button => {

    button.addEventListener('click', () => {

        const targetScreenId =
            button.getAttribute(
                'data-target'
            );

        const newTitle =
            button.getAttribute(
                'data-title'
            );


        // =====================================
        // NORMAL NAVIGATION
        // =====================================

        navButtons.forEach(btn => {

            btn.classList.remove(
                'active'
            );

        });

        button.classList.add(
            'active'
        );


        screens.forEach(screen => {

            screen.classList.remove(
                'active'
            );

        });


        const targetScreen =
            document.getElementById(
                targetScreenId
            );


        if (targetScreen) {

            targetScreen.classList.add(
                'active'
            );

        }


        if (screenTitle) {

            screenTitle.textContent =
                newTitle;

        }


        // =====================================
        // BRICK C — PRESERVE SELLER CHAT
        // =====================================

        /*
         * If the seller leaves Inbox while a
         * conversation is open:
         *
         * - hide the chat visually
         * - DO NOT clear the conversation
         * - DO NOT clear the buyer ID
         *
         * This preserves the exact chat state.
         */

        if (
            targetScreenId !==
                'inboxScreen' &&
            currentSellerConversationId
        ) {

            if (chatPanel) {

                chatPanel.style.display =
                    'none';

            }

          if (appBody) {

    appBody.classList.remove(
        'chat-open'
    );

}

            console.log(
                'BRICK C — Seller chat preserved:',
                currentSellerConversationId
            );

        }


        // =====================================
        // RETURN TO INBOX
        // =====================================

        /*
         * If the seller returns to Inbox and
         * there is still an active conversation,
         * restore that exact chat.
         */

        if (
            targetScreenId ===
                'inboxScreen' &&
            currentSellerConversationId
        ) {

            /*
             * Hide the conversation list.
             */

            if (sellerChatList) {

                sellerChatList.style.display =
                    'none';

            }


            /*
             * Hide Inbox header.
             */

            const inboxHeader =
                document.querySelector(
                    '.inbox-header'
                );

            if (inboxHeader) {

                inboxHeader.style.display =
                    'none';

            }


            /*
             * Hide Inbox search.
             */

            const inboxSearchBox =
                document.querySelector(
                    '.inbox-search'
                );

            if (inboxSearchBox) {

                inboxSearchBox.style.display =
                    'none';

            }


            /*
             * Hide Inbox filters.
             */

            const inboxFilterBar =
                document.querySelector(
                    '.inbox-filters'
                );

            if (inboxFilterBar) {

    inboxFilterBar.style.display =
        'none';

}


/* =====================================
   BRICK D — HIDE INBOX TABS
===================================== */

const inboxTabs =
    document.querySelector(
        '.inbox-tabs'
    );

if (inboxTabs) {

    inboxTabs.style.display =
        'none';

}


if (sellerChatList) {

    sellerChatList.style.display =
        'none';

}


/*
 * BRICK E — Restore exact chat position.
 */

if (chatPanel) {

    chatPanel.style.display =
        'flex';

}

if (appBody) {

    appBody.classList.add(
        'chat-open'
    );

}


            console.log(
                'BRICK C — Returning to preserved seller chat:',
                currentSellerConversationId
            );

        }

    });

});

/* =========================================
   NEXODRA — NOTIFICATIONS CENTER
   BRICK F2-B
   Bell → Notifications Screen
========================================= */

const openNotificationsBtn =
    document.getElementById(
        'openNotificationsBtn'
    );

if (openNotificationsBtn) {

    openNotificationsBtn.addEventListener(
        'click',
        () => {

            const notificationsScreen =
                document.getElementById(
                    'notificationsScreen'
                );

            if (!notificationsScreen) {
                console.error(
                    'BRICK F2-B — Notifications screen not found.'
                );
                return;
            }

            screens.forEach(screen => {
                screen.classList.remove(
                    'active'
                );
            });

            notificationsScreen.classList.add(
                'active'
            );

            if (screenTitle) {
                screenTitle.textContent =
                    'Notifications';
            }

            navButtons.forEach(button => {
                button.classList.remove(
                    'active'
                );
            });

            console.log(
                'BRICK F2-B — Notifications screen opened.'
            );
        }
    );

}

// =========================================
// C6-A — LANGUAGE & CURRENCY NAVIGATION
// =========================================

const languageCurrencyBtn =
    Array.from(
        document.querySelectorAll(
            '.profile-menu-item'
        )
    ).find(
        button =>
            button
                .querySelector(
                    '.profile-menu-text strong'
                )
                ?.textContent
                ?.trim() ===
            'Language & Currency'
    );

const languageCurrencyScreen =
    document.getElementById(
        'languageCurrencyScreen'
    );

const closeLanguageCurrencyBtn =
    document.getElementById(
        'closeLanguageCurrencyBtn'
    );

const languageCurrencyLanguage =
    document.getElementById(
        'languageCurrencyLanguage'
    );

const languageCurrencyCurrency =
    document.getElementById(
        'languageCurrencyCurrency'
    );

const languageCurrencyCurrentLanguage =
    document.getElementById(
        'languageCurrencyCurrentLanguage'
    );

const languageCurrencyCurrentCurrency =
    document.getElementById(
        'languageCurrencyCurrentCurrency'
    );


/*
 * OPEN LANGUAGE & CURRENCY
 */

if (
    languageCurrencyBtn &&
    languageCurrencyScreen
) {

    languageCurrencyBtn.addEventListener(
        'click',
        () => {

            console.log(
                'BRICK C6-A — Language & Currency opened.'
            );

            screens.forEach(
                screen => {
                    screen.classList.remove(
                        'active'
                    );
                }
            );

            languageCurrencyScreen.classList.add(
                'active'
            );

            navButtons.forEach(
                button => {
                    button.classList.remove(
                        'active'
                    );
                }
            );

            if (screenTitle) {

                screenTitle.textContent =
                    'Language & Currency';

            }

        }
    );

}


/*
 * LIVE LANGUAGE PREVIEW
 */

if (
    languageCurrencyLanguage &&
    languageCurrencyCurrentLanguage
) {

    languageCurrencyLanguage.addEventListener(
        'change',
        () => {

            const selected =
                languageCurrencyLanguage
                    .selectedOptions[0]
                    ?.textContent
                    ?.trim() ||
                'English';

            languageCurrencyCurrentLanguage
                .textContent =
                selected;

        }
    );

}


/*
 * LIVE CURRENCY PREVIEW
 */

if (
    languageCurrencyCurrency &&
    languageCurrencyCurrentCurrency
) {

    languageCurrencyCurrency.addEventListener(
        'change',
        () => {

            const selected =
                languageCurrencyCurrency
                    .selectedOptions[0]
                    ?.textContent
                    ?.trim() ||
                'USD — US Dollar ($)';

            languageCurrencyCurrentCurrency
                .textContent =
                selected;

        }
    );

}


/*
 * BACK TO PROFILE
 */

if (closeLanguageCurrencyBtn) {

    closeLanguageCurrencyBtn.addEventListener(
        'click',
        () => {

            console.log(
                'BRICK C6-A — Returning to Profile.'
            );

            const profileNav =
                document.querySelector(
                    '.nav-btn[data-target="profileScreen"]'
                );

            if (profileNav) {

                profileNav.click();

            } else {

                screens.forEach(
                    screen => {
                        screen.classList.remove(
                            'active'
                        );
                    }
                );

                const profileScreen =
                    document.getElementById(
                        'profileScreen'
                    );

                if (profileScreen) {

                    profileScreen.classList.add(
                        'active'
                    );

                }

            }

        }
    );

}

// =========================================
// C6-B — SAVE LANGUAGE & CURRENCY
// =========================================

const saveLanguageCurrencyBtn =
    document.getElementById(
        'saveLanguageCurrencyBtn'
    );


if (saveLanguageCurrencyBtn) {

    saveLanguageCurrencyBtn.addEventListener(
        'click',
        async () => {

            console.log(
                'BRICK C6-B — Saving language & currency.'
            );


            saveLanguageCurrencyBtn.disabled =
                true;


            const originalText =
                saveLanguageCurrencyBtn.innerHTML;


            saveLanguageCurrencyBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';


            try {

                // =====================================
                // GET AUTHENTICATED USER
                // =====================================

                const {
                    data: {
                        user
                    },
                    error: userError
                } =
                    await supabaseClient
                        .auth
                        .getUser();


                if (userError) {

                    throw userError;

                }


                if (!user) {

                    throw new Error(
                        'No authenticated user.'
                    );

                }


                // =====================================
                // READ SELECTED VALUES
                // =====================================

                const languageCode =
                    languageCurrencyLanguage
                        ?.value ||
                    'en';


                const currencyCode =
                    languageCurrencyCurrency
                        ?.value ||
                    'USD';


                console.log(
                    'BRICK C6-B — Selected settings:',
                    {
                        languageCode,
                        currencyCode
                    }
                );


                // =====================================
                // UPDATE STORE SETTINGS
                // =====================================

                const {
                    data: updatedStore,
                    error: updateError
                } =
                    await supabaseClient
                        .from('stores')
                        .update({

                            language_code:
                                languageCode,

                            currency_code:
                                currencyCode

                        })
                        .eq(
                            'owner_id',
                            user.id
                        )
                        .select(
                            'id, owner_id, language_code, currency_code'
                        )
                        .maybeSingle();


                if (updateError) {

                    throw updateError;

                }


                if (!updatedStore) {

                    throw new Error(
                        'No store row was updated.'
                    );

                }


                console.log(
                    'BRICK C6-B — Language & currency saved:',
                    updatedStore
                );


                // =====================================
                // UPDATE PROFILE SUBTITLE
                // =====================================

                const languageLabel =
                    languageCurrencyLanguage
                        ?.selectedOptions[0]
                        ?.textContent
                        ?.trim() ||
                    'English';


                const currencyLabel =
                    currencyCode;


                const profileLanguageCurrencyText =
                    Array.from(
                        document.querySelectorAll(
                            '.profile-menu-item'
                        )
                    )
                    .find(
                        item =>
                            item
                                .querySelector(
                                    '.profile-menu-text strong'
                                )
                                ?.textContent
                                ?.trim() ===
                            'Language & Currency'
                    )
                    ?.querySelector(
                        '.profile-menu-text span'
                    );


                if (
                    profileLanguageCurrencyText
                ) {

                    profileLanguageCurrencyText
                        .textContent =
                        `${languageLabel} · ${currencyLabel}`;

                }


                // =====================================
                // SUCCESS
                // =====================================

                console.log(
                    'BRICK C6-B — Language & currency saved successfully.'
                );


                alert(
                    'Language & currency saved successfully.'
                );


            } catch (error) {

                console.error(
                    'BRICK C6-B — Save failed:',
                    error
                );


                alert(
                    'Could not save language & currency.\n\n' +
                    (
                        error?.message ||
                        'Please try again.'
                    )
                );


            } finally {

                saveLanguageCurrencyBtn.disabled =
                    false;


                saveLanguageCurrencyBtn.innerHTML =
                    originalText;

            }

        }
    );

}

// =========================================
// C6-C — LOAD SAVED LANGUAGE & CURRENCY
// =========================================

let currentLanguageCode =
    'en';

let currentCurrencyCode =
    'USD';


async function loadLanguageCurrencySettings() {

    console.log(
        'BRICK C6-C — Loading saved language & currency.'
    );


    try {

        // =====================================
        // GET AUTHENTICATED USER
        // =====================================

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabaseClient
                .auth
                .getUser();


        if (userError) {

            throw userError;

        }


        if (!user) {

            console.warn(
                'BRICK C6-C — No authenticated user.'
            );

            return;

        }


        // =====================================
        // LOAD STORE SETTINGS
        // =====================================

        const {
            data: store,
            error: storeError
        } =
            await supabaseClient
                .from('stores')
                .select(
                    'id, owner_id, language_code, currency_code'
                )
                .eq(
                    'owner_id',
                    user.id
                )
                .maybeSingle();


        if (storeError) {

            throw storeError;

        }


        if (!store) {

            console.warn(
                'BRICK C6-C — Store not found.'
            );

            return;

        }


        // =====================================
        // RESTORE SAVED VALUES
        // =====================================

        currentLanguageCode =
            store.language_code ||
            'en';


        currentCurrencyCode =
            store.currency_code ||
            'USD';


        console.log(
            'BRICK C6-C — Saved settings loaded:',
            {
                languageCode:
                    currentLanguageCode,

                currencyCode:
                    currentCurrencyCode
            }
        );


        // =====================================
        // RESTORE LANGUAGE SELECT
        // =====================================

        if (
            languageCurrencyLanguage
        ) {

            languageCurrencyLanguage.value =
                currentLanguageCode;

        }


        // =====================================
        // RESTORE CURRENCY SELECT
        // =====================================

        if (
            languageCurrencyCurrency
        ) {

            languageCurrencyCurrency.value =
                currentCurrencyCode;

        }


        // =====================================
        // UPDATE PROFILE SUBTITLE
        // =====================================

        const languageCurrencyProfileItem =
            Array.from(
                document.querySelectorAll(
                    '.profile-menu-item'
                )
            ).find(
                item =>
                    item
                        .querySelector(
                            '.profile-menu-text strong'
                        )
                        ?.textContent
                        ?.trim() ===
                    'Language & Currency'
            );


        if (
            languageCurrencyProfileItem
        ) {

            const subtitle =
                languageCurrencyProfileItem
                    .querySelector(
                        '.profile-menu-text span'
                    );


            const languageLabel =
                languageCurrencyLanguage
                    ?.selectedOptions?.[0]
                    ?.textContent
                    ?.trim() ||
                'English';


            if (subtitle) {

                subtitle.textContent =
                    `${languageLabel} · ${currentCurrencyCode}`;

            }

        }


        console.log(
            'BRICK C6-C — Language & currency restored successfully.'
        );

      // =========================================
// C6-D-1 — VERIFY FORMATTER AFTER LOAD
// =========================================

console.log(
    'BRICK C6-D-1 — Formatter after settings load:',
    {
        currency:
            currentCurrencyCode,

        testAmount:
            1234.56,

        formatted:
            formatCurrency(
                1234.56
            )
    }
);


    } catch (error) {

        console.error(
            'BRICK C6-C — Load failed:',
            error
        );

    }

}


// =========================================
// INITIAL LOAD
// =========================================

loadLanguageCurrencySettings();

// =========================================
// C6-D — CENTRAL CURRENCY FORMATTER
// =========================================

function formatCurrency(
    amount,
    currencyCode = currentCurrencyCode
) {

    // =====================================
    // NORMALIZE AMOUNT
    // =====================================

    const numericAmount =
        Number(amount);


    const safeAmount =
        Number.isFinite(
            numericAmount
        )
            ? numericAmount
            : 0;


    // =====================================
    // NORMALIZE CURRENCY
    // =====================================

    const safeCurrency =
        String(
            currencyCode ||
            'USD'
        )
            .trim()
            .toUpperCase();


    // =====================================
    // FORMAT CURRENCY
    // =====================================

    try {

        const formatter =
            new Intl.NumberFormat(
                currentLanguageCode || 'en',
                {
                    style:
                        'currency',

                    currency:
                        safeCurrency
                }
            );


        return formatter.format(
            safeAmount
        );


    } catch (error) {

        console.warn(
            'BRICK C6-D — Currency formatter fallback:',
            error
        );


        // =================================
        // SAFE FALLBACK
        // =================================

        return (
            safeCurrency +
            ' ' +
            safeAmount.toFixed(2)
        );

    }

}


// =========================================
// BRICK C6-D — FORMATTER TEST
// =========================================

console.log(
    'BRICK C6-D — Currency formatter ready:',
    {
        currency:
            currentCurrencyCode,

        testAmount:
            1234.56,

        formatted:
            formatCurrency(
                1234.56
            )
    }
);

// =========================================
// C4-A — LOAD SELLER ORDERS
// =========================================

async function loadSellerOrders() {

    console.log(
        'BRICK ORDERS C4-A — Loading seller orders.'
    );

    try {

        // =====================================
        // GET CURRENT SELLER
        // =====================================

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabaseClient.auth.getUser();


        if (userError || !user) {

            console.error(
                'BRICK ORDERS C4-A — Seller authentication failed:',
                userError
            );

            return [];

        }


        console.log(
            'BRICK ORDERS C4-A — Seller:',
            user.id
        );


        // =====================================
        // FIND SELLER STORE
        // =====================================

        const {
            data: sellerStore,
            error: storeError
        } =
            await supabaseClient
                .from('stores')
                .select('id, owner_id')
                .eq(
                    'owner_id',
                    user.id
                )
                .maybeSingle();


        if (storeError) {

            console.error(
                'BRICK ORDERS C4-A — Store lookup failed:',
                storeError
            );

            return [];

        }


        if (!sellerStore) {

            console.warn(
                'BRICK ORDERS C4-A — Seller store not found.'
            );

            return [];

        }


        console.log(
            'BRICK ORDERS C4-A — Seller store:',
            sellerStore
        );

      console.log(
           'BRICK ORDERS C4-A — Store ID used for order query:',
          sellerStore.id
        );


        // =====================================
        // LOAD ORDERS
        // =====================================

        const {
            data: orders,
            error: ordersError
        } =
            await supabaseClient
                .from('orders')
                .select(`
                    id,
                    store_id,
                    customer_id,
                    customer_name,
                    customer_phone,
                    delivery_address,
                    city,
                    customer_notes,
                    payment_method,
                    total_amount,
                    status,
                    created_at,
                    updated_at
                `)
                .eq(
                    'store_id',
                     sellerStore.id
                 )
                .neq(
                    'status',
                   'cancelled'
                 )
                .order(
                    'created_at',
                    {
                        ascending: false
                    }
                );


        if (ordersError) {

            console.error(
                'BRICK ORDERS C4-A — Orders query failed:',
                ordersError
            );

            return [];

        }


        console.log(
            'BRICK ORDERS C4-A — Orders loaded successfully:',
            orders
        );

      console.log(
            'BRICK ORDERS C4-A — Raw orders query result:',
            orders
        );


        return orders || [];


    } catch (error) {

        console.error(
            'BRICK ORDERS C4-A — Unexpected error:',
            error
        );

        return [];

    }

}


/* =========================================
   NEXODRA — DASHBOARD PENDING ORDERS
   C4-G — CACHE + AUTO REFRESH
========================================= */

(function initPendingOrdersOverview() {

    'use strict';

    const ordersCardValue =
        document.getElementById('overviewOrders');

    if (!ordersCardValue) {
        console.warn(
            'C4-G — overviewOrders element not found.'
        );
        return;
    }

    let ordersCacheKey = null;

    // -----------------------------------------
    // GET CACHE KEY FOR CURRENT SELLER
    // -----------------------------------------

    async function getOrdersCacheKey() {

        try {

            const {
                data: {
                    user
                },
                error
            } = await supabaseClient.auth.getUser();

            if (error || !user) {
                return null;
            }

            return 'nexodra_orders_cache_' + user.id;

        } catch (error) {

            console.error(
                'C4-G — Could not identify seller:',
                error
            );

            return null;

        }

    }

    // -----------------------------------------
    // READ CACHED ORDERS
    // -----------------------------------------

    function readCachedOrders() {

        if (!ordersCacheKey) {
            return [];
        }

        try {

            const cached =
                localStorage.getItem(
                    ordersCacheKey
                );

            if (!cached) {
                return [];
            }

            const parsed =
                JSON.parse(cached);

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed;

        } catch (error) {

            console.error(
                'C4-G — Could not read cached orders:',
                error
            );

            return [];

        }

    }

    // -----------------------------------------
    // COUNT PENDING ORDERS
    // -----------------------------------------

    function countPendingOrders(orders) {

        if (!Array.isArray(orders)) {
            return 0;
        }

        return orders.filter(order => {

            const status =
                String(order.status || '')
                    .trim()
                    .toLowerCase();

            return status === 'pending';

        }).length;

    }

    // -----------------------------------------
    // UPDATE DASHBOARD CARD
    // -----------------------------------------

    function renderPendingOrdersCount(orders) {

        const pendingCount =
            countPendingOrders(orders);

        ordersCardValue.textContent =
            pendingCount.toLocaleString();

        console.log(
            'C4-G — Pending orders count:',
            pendingCount
        );

    }

    // -----------------------------------------
    // SAVE ORDERS CACHE
    // -----------------------------------------

    function saveCachedOrders(orders) {

        if (!ordersCacheKey) {
            return false;
        }

        if (!Array.isArray(orders)) {
            return false;
        }

        try {

            localStorage.setItem(
                ordersCacheKey,
                JSON.stringify(orders)
            );

            return true;

        } catch (error) {

            console.error(
                'C4-G — Could not cache orders:',
                error
            );

            return false;

        }

    }

    // -----------------------------------------
    // LOAD CACHE FIRST
    // -----------------------------------------

    async function initializeOrdersOverview() {

        ordersCacheKey =
            await getOrdersCacheKey();

        if (!ordersCacheKey) {

            console.warn(
                'C4-G — Seller not authenticated.'
            );

            return;

        }

        // Display cached count immediately.
        const cachedOrders =
            readCachedOrders();

        renderPendingOrdersCount(
            cachedOrders
        );

        // -------------------------------------
        // REFRESH FROM SUPABASE
        // -------------------------------------

        if (!navigator.onLine) {

            console.log(
                'C4-G — Offline. Showing cached orders.'
            );

            return;

        }

        await refreshOrdersOverview();

    }

    // -----------------------------------------
    // REFRESH FROM SUPABASE
    // -----------------------------------------

    async function refreshOrdersOverview() {

        if (!navigator.onLine) {
            return;
        }

        try {

            console.log(
                'C4-G — Refreshing dashboard orders.'
            );

            const orders =
                await loadSellerOrders();

            if (!Array.isArray(orders)) {
                return;
            }

            // Cache the latest seller orders.
            saveCachedOrders(orders);

            // Update the dashboard count.
            renderPendingOrdersCount(
                orders
            );

            console.log(
                'C4-G — Dashboard orders refreshed.'
            );

        } catch (error) {

            console.error(
                'C4-G — Orders refresh failed:',
                error
            );

            // Keep the last cached count.
            renderPendingOrdersCount(
                readCachedOrders()
            );

        }

    }

    // -----------------------------------------
    // ONLINE EVENT
    // -----------------------------------------

    window.addEventListener(
        'online',
        function () {

            console.log(
                'C4-G — Device online. Refreshing orders.'
            );

            refreshOrdersOverview();

        }
    );

    // -----------------------------------------
    // REFRESH AFTER ORDER SCREEN LOAD
    // -----------------------------------------

    window.addEventListener(
        'nexodra:orders-updated',
        function () {

            refreshOrdersOverview();

        }
    );

    // -----------------------------------------
    // INITIALIZE
    // -----------------------------------------

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            initializeOrdersOverview,
            {
                once: true
            }
        );

    } else {

        initializeOrdersOverview();

    }

})();



/* =========================================
   NEXODRA — ORDERS SCREEN
   BRICK F3-B
   Orders received card → Orders screen
========================================= */

const openOrdersCard =
    document.getElementById('openOrdersCard');

const openOrdersBtn =
    document.getElementById('openOrdersBtn');

const ordersEntryPoints = [
    openOrdersCard,
    openOrdersBtn
].filter(Boolean);

if (ordersEntryPoints.length > 0) {

    const openOrdersScreen = async () => {

        const ordersScreen =
            document.getElementById(
                'ordersScreen'
            );

        if (!ordersScreen) {
            console.error(
                'BRICK F3-B — Orders screen not found.'
            );
            return;
        }

        screens.forEach(screen => {
            screen.classList.remove(
                'active'
            );
        });

        ordersScreen.classList.add(
            'active'
        );

        if (screenTitle) {
            screenTitle.textContent =
                'Orders';
        }

      const sellerOrders =
    await loadSellerOrders();

console.log(
    'BRICK ORDERS C4-A — Orders available for screen:',
    sellerOrders
);


/* C4-G — Notify dashboard that orders were refreshed */

window.dispatchEvent(
    new Event('nexodra:orders-updated')
);

      
      // =========================================
// C4-B — RENDER SELLER ORDERS
// =========================================

const ordersList =
    document.getElementById('ordersList');

if (!ordersList) {

    console.error(
        'BRICK ORDERS C4-B — ordersList not found.'
    );

} else if (
    !sellerOrders ||
    sellerOrders.length === 0
) {

    ordersList.innerHTML = `
        <div class="orders-empty">

            <div class="orders-empty-icon">
                <i class="fa-regular fa-clipboard"></i>
            </div>

            <h3>
                No orders yet
            </h3>

            <p>
                Customer orders will appear here.
            </p>

        </div>
    `;

    console.log(
        'BRICK ORDERS C4-B — No orders to render.'
    );

} else {

    ordersList.innerHTML =
        sellerOrders.map(order => {

            const customerName =
                order.customer_name ||
                'Customer';

            const totalAmount =
    formatCurrency(
        Number(order.total_amount) || 0
    );

            const status =
                String(
                    order.status || 'pending'
                )
                .trim()
                .toLowerCase();

            const createdAt =
                order.created_at
                    ? new Date(
                        order.created_at
                    ).toLocaleString()
                    : '';

            return `
                <div
                  class="order-card"
                   data-order-id="${order.id}"
                  data-order-status="${status}"
                   tabindex="0"
                   role="button"
                >

                    <div class="order-card-header">

                        <div>
                            <strong>
                                ${customerName}
                            </strong>

                            <span>
                                ${createdAt}
                            </span>
                        </div>

                        <span class="order-status">
                            ${status}
                        </span>

                    </div>

                    <div class="order-card-body">

                        <p>
                            <strong>
                                Total:
                            </strong>
                            ${totalAmount}
                        </p>

                        <p>
                            <strong>
                                Phone:
                            </strong>
                            ${order.customer_phone || ''}
                        </p>

                        <p>
                            <strong>
                                Delivery:
                            </strong>
                            ${order.delivery_address || ''}
                        </p>

                        <p>
                            <strong>
                                City:
                            </strong>
                            ${order.city || ''}
                        </p>

                    </div>

                </div>
            `;

        }).join('');

    console.log(
        'BRICK ORDERS C4-B — Orders rendered:',
        sellerOrders.length
    );

  // =========================================
// C4-C — ORDER CARD CLICK
// =========================================

document
    .querySelectorAll('.order-card')
    .forEach(orderCard => {

        orderCard.addEventListener(
            'click',
            async () => {

                const orderId =
                    orderCard.dataset.orderId;

                const selectedOrder =
                    sellerOrders.find(
                        order =>
                            String(order.id) ===
                            String(orderId)
                    );

              window.currentOrderForAction = selectedOrder;

                console.log(
                    'BRICK ORDERS C4-C — Order selected:',
                    selectedOrder
                );

              // =========================================
// C4-D — OPEN ORDER DETAIL
// =========================================

const orderDetailOverlay =
    document.getElementById('orderDetailOverlay');

const orderDetailTitle =
    document.getElementById('orderDetailTitle');

const orderDetailCustomerName =
    document.getElementById('orderDetailCustomerName');

const orderDetailCustomerPhone =
    document.getElementById('orderDetailCustomerPhone');

const orderDetailAddress =
    document.getElementById('orderDetailAddress');

const orderDetailCity =
    document.getElementById('orderDetailCity');

const orderDetailStatus =
    document.getElementById('orderDetailStatus');

const orderDetailPayment =
    document.getElementById('orderDetailPayment');

const orderDetailTotal =
    document.getElementById('orderDetailTotal');

if (
    !orderDetailOverlay ||
    !selectedOrder
) {
    console.error(
        'BRICK ORDERS C4-D — Detail overlay or order not found.'
    );
    return;
}

orderDetailTitle.textContent =
    `Order #${String(selectedOrder.id).slice(0, 8)}`;

orderDetailCustomerName.textContent =
    selectedOrder.customer_name || '—';

orderDetailCustomerPhone.textContent =
    selectedOrder.customer_phone || '—';

orderDetailAddress.textContent =
    selectedOrder.delivery_address || '—';

orderDetailCity.textContent =
    selectedOrder.city || '—';

orderDetailStatus.textContent =
    selectedOrder.status || '—';

orderDetailPayment.textContent =
    selectedOrder.payment_method || '—';

orderDetailTotal.textContent =
    formatCurrency(
        Number(selectedOrder.total_amount || 0)
    );

// =========================================
// C4-E — LOAD ORDER PRODUCTS
// =========================================

const orderDetailProducts =
    document.getElementById('orderDetailProducts');

if (orderDetailProducts) {

    orderDetailProducts.innerHTML = `
        <p class="order-detail-placeholder">
            Loading products...
        </p>
    `;

    try {

        console.log(
            'BRICK ORDERS C4-E — Loading order items:',
            selectedOrder.id
        );

        const {
            data: orderItems,
            error: orderItemsError
        } = await supabaseClient
            .from('order_items')
            .select(`
                id,
                order_id,
                product_id,
                product_name,
                price,
                quantity,
                subtotal,
                created_at
            `)
            .eq('order_id', selectedOrder.id)
            .order('created_at', {
                ascending: true
            });

        if (orderItemsError) {

    console.error(
        'BRICK ORDERS C4-E — Order items load failed:',
        orderItemsError
    );

    orderDetailProducts.innerHTML = `
        <p class="order-detail-placeholder">
            Could not load ordered products.
        </p>
    `;

} else if (!orderItems || orderItems.length === 0) {

    orderDetailProducts.innerHTML = `
        <p class="order-detail-placeholder">
            No products found for this order.
        </p>
    `;

} else {

    orderDetailProducts.innerHTML =
        orderItems.map(item => {

                const quantity =
                    Number(item.quantity) || 1;

                const price =
                    Number(item.price) || 0;

                const subtotal =
                    Number(item.subtotal) ||
                    (price * quantity);

                return `
                    <div class="order-product-row">

                        <div class="order-product-info">

                            <strong>
                                ${item.product_name || 'Product'}
                            </strong>

                            <span>
    ${quantity} × ${formatCurrency(price)}
</span>

                        </div>

                        <strong class="order-product-subtotal">
    ${formatCurrency(subtotal)}
</strong>

                    </div>
                `;

            }).join('');

        console.log(
            'BRICK ORDERS C4-E — Products rendered:',
            orderItems.length
        );

        }

    } catch (error) {

        console.error(
            'BRICK ORDERS C4-E — Unexpected product load error:',
            error
        );

        orderDetailProducts.innerHTML = `
            <p class="order-detail-placeholder">
                Could not load ordered products.
            </p>
        `;
    }
}
              
orderDetailOverlay.classList.add('active');

orderDetailOverlay.setAttribute(
    'aria-hidden',
    'false'
);

console.log(
    'BRICK ORDERS C4-D — Order detail opened:',
    selectedOrder.id
);

            }
        );

        orderCard.addEventListener(
            'keydown',
            event => {

                if (
                    event.key === 'Enter' ||
                    event.key === ' '
                ) {

                    event.preventDefault();

                    orderCard.click();

                }

            }
        );

    });

console.log(
    'BRICK ORDERS C4-C — Order cards are clickable.'
);

  // =========================================
// C4-D — CLOSE ORDER DETAIL
// =========================================

const orderDetailCloseBtn =
    document.getElementById('orderDetailCloseBtn');

const orderDetailBackdrop =
    document.getElementById('orderDetailBackdrop');

function closeOrderDetail() {

    if (!orderDetailOverlay) {
        return;
    }

    orderDetailOverlay.classList.remove('active');

    orderDetailOverlay.setAttribute(
        'aria-hidden',
        'true'
    );

    console.log(
        'BRICK ORDERS C4-D — Order detail closed.'
    );
}
  
// =========================================
// C4-F-C — REJECT ORDER MODAL
// =========================================

const orderRejectBtn =
    document.getElementById('orderRejectBtn');

const rejectOrderModal =
    document.getElementById('rejectOrderModal');

const rejectionReasonInput =
    document.getElementById('rejectionReasonInput');

const cancelRejectOrderBtn =
    document.getElementById('cancelRejectOrderBtn');

const confirmRejectOrderBtn =
    document.getElementById('confirmRejectOrderBtn');


if (
    orderRejectBtn &&
    rejectOrderModal &&
    !orderRejectBtn.dataset.rejectReady
) {

    orderRejectBtn.dataset.rejectReady =
        'true';


    // Open rejection modal

    orderRejectBtn.addEventListener(
        'click',
        () => {

            const selectedOrder =
                window.currentOrderForAction;

     console.log(
    'BRICK C4-F-C DIAGNOSTIC — Reject button clicked.',
    {
        orderRejectBtn,
        rejectOrderModal,
        selectedOrder
    }
);

          console.log(
    'BRICK C4-F-C MODAL STATE — Before opening:',
    {
        modalExists: !!rejectOrderModal,
        modalClass: rejectOrderModal?.className,
        modalDisplay: rejectOrderModal
            ? getComputedStyle(rejectOrderModal).display
            : 'NO MODAL',
        modalParent: rejectOrderModal?.parentElement?.id || 'NO PARENT'
    }
);
          
            if (!selectedOrder) {

                console.error(
                    'BRICK ORDERS C4-F-C — No selected order.'
                );

                return;
            }


            if (rejectionReasonInput) {

                rejectionReasonInput.value =
                    '';

            }


            rejectOrderModal.classList.add(
                'active'
            );

          console.log(
    'BRICK C4-F-C MODAL STATE — After opening:',
    {
        modalClass: rejectOrderModal.className,
        modalDisplay: getComputedStyle(
            rejectOrderModal
        ).display,
        hasActiveClass:
            rejectOrderModal.classList.contains(
                'active'
            )
    }
);

          console.log(
    'BRICK C4-F-C MODAL GEOMETRY:',
    {
        rect: rejectOrderModal.getBoundingClientRect(),
        zIndex: getComputedStyle(
            rejectOrderModal
        ).zIndex,
        position: getComputedStyle(
            rejectOrderModal
        ).position,
        opacity: getComputedStyle(
            rejectOrderModal
        ).opacity,
        visibility: getComputedStyle(
            rejectOrderModal
        ).visibility
    }
);

          console.log(
    'BRICK C4-F-C MODAL SIZE:',
    {
        width: rejectOrderModal.offsetWidth,
        height: rejectOrderModal.offsetHeight,
        clientWidth: rejectOrderModal.clientWidth,
        clientHeight: rejectOrderModal.clientHeight,
        parentWidth:
            rejectOrderModal.parentElement?.offsetWidth,
        parentHeight:
            rejectOrderModal.parentElement?.offsetHeight
    }
);

          console.log(
    'BRICK C4-F-C PARENT CHAIN:',
    {
        modal: rejectOrderModal.parentElement?.id,
        parentParent:
            rejectOrderModal.parentElement?.parentElement?.id,
        parentDisplay:
            rejectOrderModal.parentElement
                ? getComputedStyle(
                    rejectOrderModal.parentElement
                ).display
                : 'NO PARENT',
        parentVisibility:
            rejectOrderModal.parentElement
                ? getComputedStyle(
                    rejectOrderModal.parentElement
                ).visibility
                : 'NO PARENT',
        parentPosition:
            rejectOrderModal.parentElement
                ? getComputedStyle(
                    rejectOrderModal.parentElement
                ).position
                : 'NO PARENT'
    }
);


            if (rejectionReasonInput) {

                setTimeout(() => {

                    rejectionReasonInput.focus();

                }, 100);

            }

        }
    );


    // Cancel rejection

    if (cancelRejectOrderBtn) {

        cancelRejectOrderBtn.addEventListener(
            'click',
            () => {

                rejectOrderModal.classList.remove(
                    'active'
                );

            }
        );

    }


    // Confirm rejection

    if (confirmRejectOrderBtn) {

        confirmRejectOrderBtn.addEventListener(
            'click',
            async () => {

                const selectedOrder =
                    window.currentOrderForAction;

                if (!selectedOrder) {

                    console.error(
                        'BRICK ORDERS C4-F-C — No selected order.'
                    );

                    return;
                }


                const trimmedReason =
                    rejectionReasonInput
                        ?.value
                        .trim() || '';


                if (!trimmedReason) {

                    alert(
                        'Please enter a rejection reason.'
                    );

                    rejectionReasonInput?.focus();

                    return;

                }


                confirmRejectOrderBtn.disabled =
                    true;

                confirmRejectOrderBtn.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Rejecting...
                `;


                try {

                    console.log(
                        'BRICK ORDERS C4-F-C — Rejecting order:',
                        selectedOrder.id
                    );


                    const {
                        data: updatedOrder,
                        error: updateError
                    } = await supabaseClient
                        .from('orders')
                        .update({
                            status: 'cancelled',
                            rejection_reason:
                                trimmedReason,
                            updated_at:
                                new Date().toISOString()
                        })
                        .eq(
                            'id',
                            selectedOrder.id
                        )
                        .select()
                        .single();


                    if (updateError) {

                        console.error(
                            'BRICK ORDERS C4-F-C — Reject failed:',
                            updateError
                        );

                        alert(
                            'The order could not be rejected.\n\n' +
                            updateError.message
                        );

                        return;

                    }


                    console.log(
                        'BRICK ORDERS C4-F-C — Order rejected:',
                        updatedOrder
                    );


                    selectedOrder.status =
                        'cancelled';

                    selectedOrder.rejection_reason =
                        trimmedReason;


                    rejectOrderModal.classList.remove(
                        'active'
                    );


                    closeOrderDetail();


                    alert(
                        'Order rejected successfully.'
                    );


                } catch (error) {

                    console.error(
                        'BRICK ORDERS C4-F-C — Unexpected rejection error:',
                        error
                    );

                    alert(
                        'The order could not be rejected.'
                    );

                } finally {

                    confirmRejectOrderBtn.disabled =
                        false;

                    confirmRejectOrderBtn.innerHTML = `
                        Reject Order
                    `;

                }

            }
        );

    }

}           
  
  // =========================================
// C4-F-B — PROCEED ORDER
// =========================================

const orderProceedBtn =
    document.getElementById('orderProceedBtn');

if (orderProceedBtn && !orderProceedBtn.dataset.proceedReady) {

    orderProceedBtn.dataset.proceedReady = 'true';

    orderProceedBtn.addEventListener(
        'click',
        async () => {

            const selectedOrder =
                window.currentOrderForAction;

            if (!selectedOrder) {

                console.error(
                    'BRICK ORDERS C4-F-B — No selected order.'
                );

                return;
            }

            orderProceedBtn.disabled = true;

            orderProceedBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Processing...
            `;

            try {

                console.log(
                    'BRICK ORDERS C4-F-B — Proceeding order:',
                    selectedOrder.id
                );

                // =====================================
                // LOAD ORDER ITEMS
                // =====================================

                const {
                    data: orderItems,
                    error: orderItemsError
                } = await supabaseClient
                    .from('order_items')
                    .select(`
                        product_id,
                        product_name,
                        price,
                        quantity,
                        subtotal
                    `)
                    .eq(
                        'order_id',
                        selectedOrder.id
                    )
                    .order(
                        'created_at',
                        {
                            ascending: true
                        }
                    );

                if (orderItemsError) {

                    console.error(
                        'BRICK ORDERS C4-F-B — Could not load order items:',
                        orderItemsError
                    );

                    alert(
                        'The order could not be processed.\n\n' +
                        orderItemsError.message
                    );

                    return;
                }

                if (
                    !orderItems ||
                    orderItems.length === 0
                ) {

                    console.error(
                        'BRICK ORDERS C4-F-B — Order has no items.'
                    );

                    alert(
                        'This order has no products to complete.'
                    );

                    return;
                }

                // =====================================
                // CONVERT ORDER ITEMS
                // TO EXISTING SALE FORMAT
                // =====================================

                const saleItems =
                    orderItems.map(
                        item => ({
                            productId:
                                item.product_id,

                            title:
                                item.product_name ||
                                'Product',

                            price:
                                Number(
                                    item.price || 0
                                ),

                            image:
                                '',

                            emoji:
                                '📦',

                            quantity:
                                Number(
                                    item.quantity || 1
                                )
                        })
                    );

                const totalItems =
                    saleItems.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item.quantity || 0
                            ),
                        0
                    );

                const grandTotal =
                    Number(
                        selectedOrder.total_amount || 0
                    );

                console.log(
                    'BRICK ORDERS C4-F-B — Completing sale:',
                    {
                        orderId:
                            selectedOrder.id,

                        items:
                            saleItems,

                        totalItems:
                            totalItems,

                        total:
                            grandTotal
                    }
                );

                // =====================================
                // RECORD SALE
                // =====================================

                const {
                    data: saleId,
                    error: saleError
                } =
                    await supabaseClient.rpc(
                        'complete_sale',
                        {

                            p_items:
                                saleItems,

                            p_items_count:
                                totalItems,

                            p_subtotal:
                                grandTotal,

                            p_discount:
                                0,

                            p_tax:
                                0,

                            p_total:
                                grandTotal,

                            p_customer_name:
                                selectedOrder.customer_name ||
                                'Customer',

                            p_note:
                                selectedOrder.customer_notes ||
                                '',

                            p_payment_method:
                                'cash'

                        }
                    );

                if (saleError) {

                    console.error(
                        'BRICK ORDERS C4-F-B — Sale failed:',
                        saleError
                    );

                    alert(
                        'The sale could not be completed.\n\n' +
                        saleError.message
                    );

                    return;
                }

                console.log(
                    'BRICK ORDERS C4-F-B — Sale recorded:',
                    saleId
                );

                // =====================================
                // MARK ORDER AS FULFILLED
                // =====================================

                const {
                    data: updatedOrder,
                    error: updateOrderError
                } =
                    await supabaseClient
                        .from('orders')
                        .update({
                            status:
                                'delivered',

                            updated_at:
                                new Date().toISOString()
                        })
                        .eq(
                            'id',
                            selectedOrder.id
                        )
                        .select()
                        .single();

                if (updateOrderError) {

                    console.error(
                        'BRICK ORDERS C4-F-B — Order status update failed:',
                        updateOrderError
                    );

                    alert(
                        'The sale was recorded, but the order could not be marked as fulfilled.\n\n' +
                        updateOrderError.message
                    );

                    return;
                }

                console.log(
                    'BRICK ORDERS C4-F-B — Order fulfilled:',
                    updatedOrder
                );

                // =====================================
                // UPDATE CURRENT ORDER
                // =====================================

                selectedOrder.status =
                    'delivered';

                // =====================================
                // CLOSE DETAIL
                // =====================================

                closeOrderDetail();

                // =====================================
                // UPDATE CARD VISUALLY
                // =====================================

                const orderCard =
                    document.querySelector(
                        `.order-card[data-order-id="${selectedOrder.id}"]`
                    );

                if (orderCard) {

                    orderCard.dataset.orderStatus =
                        'fulfilled';

                    const statusElement =
                        orderCard.querySelector(
                            '.order-status'
                        );

                    if (statusElement) {

                        statusElement.textContent =
                            'fulfilled';

                    }
                }

                alert(
                    'Order completed successfully.\n\n' +
                    `Sale recorded: ${saleId}`
                );

                console.log(
                    'BRICK ORDERS C4-F-B — Proceed complete.'
                );

            } catch (error) {

                console.error(
                    'BRICK ORDERS C4-F-B — Unexpected error:',
                    error
                );

                alert(
                    'An unexpected error occurred while completing the order.\n\n' +
                    (error?.message || error)
                );

            } finally {

                orderProceedBtn.disabled = false;

                orderProceedBtn.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Proceed
                `;

            }
        }
    );
}

if (orderDetailCloseBtn) {
    orderDetailCloseBtn.addEventListener(
        'click',
        closeOrderDetail
    );
}

if (orderDetailBackdrop) {
    orderDetailBackdrop.addEventListener(
        'click',
        closeOrderDetail
    );
}

console.log(
    'BRICK ORDERS C4-D — Close behavior ready.'
);

}

        navButtons.forEach(button => {
            button.classList.remove(
                'active'
            );
        });

        console.log(
            'BRICK F3-B — Orders screen opened.'
        );
    };

    ordersEntryPoints.forEach(entryPoint => {
    entryPoint.addEventListener(
        'click',
        openOrdersScreen
    );
});

    ordersEntryPoints.forEach(entryPoint => {
    entryPoint.addEventListener(
        'keydown',
        event => {
            if (
                event.key === 'Enter' ||
                event.key === ' '
            ) {
                event.preventDefault();
                openOrdersScreen();
            }
        }
    );
});

}

// =========================================
// STORE SALES OVERVIEW — OPEN
// =========================================

const openSalesOverview =
    document.getElementById(
        'openSalesOverview'
    );


if (openSalesOverview) {

    openSalesOverview.addEventListener(
        'click',
        () => {

            console.log(
                'STORE OVERVIEW — Sales card clicked'
            );


            const salesOverviewScreen =
                document.getElementById(
                    'salesOverviewScreen'
                );


            if (!salesOverviewScreen) {

                console.error(
                    'STORE OVERVIEW — salesOverviewScreen not found.'
                );

                return;
            }


            // Hide all screens
            screens.forEach(screen => {

                screen.classList.remove(
                    'active'
                );

            });


            // Show sales overview
            salesOverviewScreen.classList.add(
                'active'
            );

          if (typeof initializeCharts === 'function') {
    initializeCharts();
}


            // Update title if available
            if (screenTitle) {

                screenTitle.textContent =
                    'Sales Overview';

            }


            // Remove active state from bottom navigation
            navButtons.forEach(button => {

                button.classList.remove(
                    'active'
                );

            });


            // Load sales overview data
            if (
                typeof loadSalesOverview ===
                'function'
            ) {

                loadSalesOverview();

            }

        }
    );


    // Also allow keyboard activation
    openSalesOverview.addEventListener(
        'keydown',
        (event) => {

            if (
                event.key === 'Enter' ||
                event.key === ' '
            ) {

                event.preventDefault();

                openSalesOverview.click();

            }

        }
    );

}



// =========================================
// INVENTORY SETTINGS
// =========================================

let currentInventoryFilter = 'all';

let currentSearchTerm = '';


// =========================================
// STOCK STATUS
// =========================================

function getStockStatus(stock) {

    const amount = Number(stock);


    if (amount <= 0) {

        return {
            className: 'stock-out',
            label: 'Out of Stock'
        };

    }


    if (amount <= 5) {

        return {
            className: 'stock-low',
            label: 'Low Stock'
        };

    }


    return {
        className: 'stock-in',
        label: 'In Stock'
    };

}

// =========================================
// STORE OVERVIEW - REAL INVENTORY DATA
// =========================================

function updateStoreOverview() {

    const productsElement =
        document.getElementById(
            'overviewProducts'
        );

    const inStockElement =
        document.getElementById(
            'overviewInStock'
        );

    const stockElement =
        document.getElementById(
            'overviewStock'
        );

    const lowStockElement =
        document.getElementById(
            'overviewLowStock'
        );

    const outOfStockElement =
        document.getElementById(
            'overviewOutOfStock'
        );


    // Total number of products
    const totalProducts =
        products.length;


    // Total stock units
    const totalStock =
        products.reduce(
            (total, product) => {

                return total +
                    Number(product.stock || 0);

            },
            0
        );


    // Products with more than 5 units
    // = IN STOCK
    const inStock =
        products.filter(product => {

            const stock =
                Number(product.stock || 0);

            return stock > 5;

        }).length;


    // Products with 1–5 units
    // = LOW STOCK
    const lowStock =
        products.filter(product => {

            const stock =
                Number(product.stock || 0);

            return stock > 0 &&
                   stock <= 5;

        }).length;


    // Products with 0 units
    // = OUT OF STOCK
    const outOfStock =
        products.filter(product => {

            return Number(
                product.stock || 0
            ) <= 0;

        }).length;


    // Update Products
    if (productsElement) {

        productsElement.textContent =
            totalProducts;

    }


    // Update In Stock
    if (inStockElement) {

        inStockElement.textContent =
            inStock;

    }


    // Update Total Stock Units
    if (stockElement) {

        stockElement.textContent =
            totalStock;

    }


    // Update Low Stock
    if (lowStockElement) {

        lowStockElement.textContent =
            lowStock;

    }


    // Update Out of Stock
    if (outOfStockElement) {

        outOfStockElement.textContent =
            outOfStock;

    }

}

// =========================================
// C7-A — PRODUCT LOADING SKELETONS
// =========================================

function showProductLoadingState(
    grid,
    count = 6
) {

    if (!grid) {
        return;
    }

    const safeCount =
        Math.max(
            2,
            Math.min(
                Number(count) || 6,
                8
            )
        );

    grid.innerHTML =
        Array.from(
            { length: safeCount },
            () => `
                <div class="product-loading-skeleton">

                    <div
                        class="product-loading-skeleton-image"
                    ></div>

                    <div
                        class="product-loading-skeleton-line"
                    ></div>

                    <div
                        class="product-loading-skeleton-line short"
                    ></div>

                    <div
                        class="product-loading-skeleton-line price"
                    ></div>

                </div>
            `
        ).join('');

}

// =========================================
// RENDER PRODUCTS
// =========================================

function renderProducts() {
  updateStoreOverview();
    const productsCount =
        document.getElementById('productsCount');


    if (productsCount) {

        productsCount.textContent =
            `${products.length} ${
                products.length === 1
                ? 'product'
                : 'products'
            }`;

    }


    const filteredProducts =
        products.filter(product => {

            const searchMatch =
                product.title
                    .toLowerCase()
                    .includes(currentSearchTerm);


            const stockAmount =
                Number(product.stock);


            let stockMatch = true;


            if (
                currentInventoryFilter === 'in-stock'
            ) {

                stockMatch =
                    stockAmount > 5;

            }


            if (
                currentInventoryFilter === 'low-stock'
            ) {

                stockMatch =
                    stockAmount > 0 &&
                    stockAmount <= 5;

            }


            if (
                currentInventoryFilter === 'out-of-stock'
            ) {

                stockMatch =
                    stockAmount <= 0;

            }


            return searchMatch && stockMatch;

        });


    // No products

    if (filteredProducts.length === 0) {

        productGrid.innerHTML = `

            <p class="empty-text">

                ${
                    products.length === 0
                    ? 'No products posted yet. Use the (+) tab to add items!'
                    : 'No products match your search or filter.'
                }

            </p>

        `;

        return;

    }


    productGrid.innerHTML = '';


    // Create product cards

    filteredProducts.forEach(product => {

        const stockStatus =
            getStockStatus(product.stock);


        const card =
            document.createElement('div');


        card.className =
                  'product-card product-card-enter';


        card.innerHTML = `

            <div class="product-img-box">

                <span class="product-category-badge">
                    ${product.category}
                </span>


               <button
    class="product-edit-btn"
    data-product-id="${product.id}"
    type="button"
    aria-label="Edit ${product.title}"
>

    <i class="fa-solid fa-pen"></i>

</button>


                ${product.image
    ? `
        <img
            class="product-image"
            src="${product.image}"
            alt="${product.title}"
        >
      `
    : `
        <span class="product-emoji">
            ${product.emoji}
        </span>
      `
}

            </div>


            <div class="product-details">

                <h4>
                    ${product.title}
                </h4>


                <div class="product-meta">

                    <span class="product-price">
    ${formatCurrency(Number(product.price))}
</span>


                    <span
                        class="product-stock-status ${stockStatus.className}"
                    >

                        <span class="stock-dot"></span>

                        ${stockStatus.label}

                    </span>

                </div>


                <div class="product-card-footer">

    <span class="product-stock-number">
        ${product.stock} units
    </span>

    <button
        class="product-delete-btn"
        data-product-id="${product.id}"
        type="button"
        aria-label="Delete ${product.title}"
    >
        <i class="fa-solid fa-trash"></i>
    </button>

</div>


            </div>

        `;
        // Open product details when card is tapped
card.addEventListener('click', (e) => {

    // Ignore edit and delete button clicks
    if (
        e.target.closest('.product-edit-btn') ||
        e.target.closest('.product-delete-btn')
    ) {
        return;
    }


    const overlay =
        document.getElementById(
            'productDetailsOverlay'
        );

    const imageBox =
        document.getElementById(
            'productDetailsImage'
        );

    const categoryBox =
        document.getElementById(
            'productDetailsCategory'
        );

    const titleBox =
        document.getElementById(
            'productDetailsTitle'
        );

    const priceBox =
        document.querySelector(
            '.product-details-price'
        );

    const stockBox =
        document.getElementById(
            'productDetailsStock'
        );

    const descriptionBox =
        document.getElementById(
            'productDetailsDescription'
        );
  const variantsBox =
    document.getElementById(
        'productDetailsVariants'
    );

const variantOptionsBox =
    document.getElementById(
        'productDetailsVariantOptions'
    );


    if (!overlay) {
        return;
    }


    // Product image
    if (product.image) {

        imageBox.innerHTML = `
            <img
                src="${product.image}"
                alt="${product.title}"
            >
        `;

    } else {

        imageBox.innerHTML = `
            <span class="product-details-emoji">
                ${product.emoji || '📦'}
            </span>
        `;

    }


    // Product information
    categoryBox.textContent =
        product.category || 'Product';

    titleBox.textContent =
        product.title || 'Untitled Product';

    priceBox.textContent =
    formatCurrency(
        Number(product.price || 0)
    );

    stockBox.textContent =
        Number(product.stock || 0) +
        ' units available';

    descriptionBox.textContent =
        product.description ||
        'No description added.';


    // Show details panel
    overlay.classList.add('active');

});

        productGrid.appendChild(card);

    });

}
// Close product details
const productDetailsClose =
    document.getElementById(
        'productDetailsClose'
    );

const productDetailsOverlay =
    document.getElementById(
        'productDetailsOverlay'
    );


if (productDetailsClose) {

    productDetailsClose.addEventListener(
        'click',
        () => {

            productDetailsOverlay
                ?.classList.remove('active');

        }
    );

}


if (productDetailsOverlay) {

    productDetailsOverlay.addEventListener(
        'click',
        (e) => {

            if (
                e.target ===
                productDetailsOverlay
            ) {

                productDetailsOverlay
                    .classList.remove('active');

            }

        }
    );

}

/*
 * CUSTOMER CART — BRICK B1
 *
 * Single cart store used by:
 * - Product Details
 * - Customer product-card shortcuts
 * - Customer Cart navigation
 */

window.odropCart =
    Array.isArray(window.odropCart)
        ? window.odropCart
        : [];

console.log(
    'BRICK CUSTOMER CART B1 — Cart initialized:',
    window.odropCart
);


// =========================================
// PRODUCT FORM SUBMISSION
// =========================================
if (productForm) {

    productForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const title =
            document.getElementById('productTitle')
                ?.value.trim();

        const category =
            document.getElementById('productCategory')
                ?.value;

        const price =
            document.getElementById('productPrice')
                ?.value;

        const stock =
            document.getElementById('productStock')
                ?.value;

        const emoji =
            document.getElementById('productEmoji')
                ?.value.trim() || '📦';

        const barcode =
    normalizeOdropBarcode(
        document.getElementById('productBarcode')
            ?.value || ''
    );

        const description =
            document.getElementById('productDescription')
                ?.value.trim() || '';
        // Product variants
const variantSize =
    document.getElementById('variantSize')
        ?.value.trim() || '';

const variantColor =
    document.getElementById('variantColor')
        ?.value.trim() || '';

const variants = {
    size: variantSize
        ? variantSize
            .split(',')
            .map(value => value.trim())
            .filter(Boolean)
        : [],

    color: variantColor
        ? variantColor
            .split(',')
            .map(value => value.trim())
            .filter(Boolean)
        : []
};
        const publishedInput =
            document.getElementById('productPublished');

        const published =
            publishedInput
                ? publishedInput.checked
                : true;


        // Basic validation
        if (!title) {
            alert('Please enter a product name.');
            return;
        }

        if (!price || Number(price) <= 0) {
            alert('Please enter a valid product price.');
            return;
        }

        if (stock === '' || Number(stock) < 0) {
            alert('Please enter a valid stock quantity.');
            return;
        }


        // =========================================
// CREATE OR UPDATE PRODUCT
// =========================================

if (editingProductId !== null) {

    const productIndex =
        products.findIndex(
            item => item.id === editingProductId
        );

    if (productIndex === -1) {

        alert('The product could not be found.');

        editingProductId = null;

        return;
    }

    // Keep the existing image if no new image was selected
    const existingImage =
        products[productIndex].image || '';

    products[productIndex] = {

        ...products[productIndex],

        title: title,

        category: category,

        price: Number(price),

        stock: Number(stock),

        emoji: emoji,

        image:
            selectedProductImage ||
            existingImage,

        barcode: barcode,

        description: description,

        published: published

    };
  

        } else {

    const newProduct = {

        id: Date.now(),

        title: title,
      
        variants : variants, 

        category: category,

        price: Number(price),

        stock: Number(stock),

        emoji: emoji,

        image: selectedProductImage || '',

        barcode: barcode,

        description: description,

        published: published

    };

    products.push(newProduct);

}

  // =========================================
// BRICK 3E — GET PRODUCT OWNER
// =========================================

const {
    data: {
        user
    },
    error: userError
} = await supabaseClient.auth.getUser();


if (userError) {

    console.error(
        'BRICK 3E — Could not get authenticated user:',
        userError
    );

    return;
}


if (!user) {

    console.error(
        'BRICK 3E — No authenticated user.'
    );

    return;
}


console.log(
    'BRICK 3E — Product owner:',
    user.id
);


  // =========================================
// SAVE PRODUCT TO SUPABASE
// =========================================

try {

    // =========================================
    // EDIT EXISTING PRODUCT
    // =========================================

    if (editingProductId !== null) {

        console.log(
            'PRODUCT EDIT — Updating Supabase product:',
            editingProductId
        );


        const {
            error: updateError
        } = await supabaseClient
            .from('products')
            .update({

                title:
                    title,

                category:
                    category,

                price:
                    Number(price),

                stock:
                    Number(stock),

                emoji:
                    emoji,

                image:
                    selectedProductImage ||
                    products.find(
                        item =>
                            String(item.id) ===
                            String(editingProductId)
                    )?.image ||
                    null,

                barcode:
                    barcode,

                description:
                    description,

                published:
                    published,

                variants:
                    variants

            })
            .eq(
                'id',
                editingProductId
            )
            .eq(
                'owner_id',
                user.id
            );


        if (updateError) {

            console.error(
                'PRODUCT EDIT — Supabase update failed:',
                updateError
            );

            alert(
                'The product was changed locally, but could not be updated online.\n\n' +
                updateError.message
            );

            return;

        }


        console.log(
            'PRODUCT EDIT — Supabase product updated successfully.'
        );


    }

    // =========================================
    // CREATE NEW PRODUCT
    // =========================================

    else {

        console.log(
            'PRODUCT CREATE — Saving new product to Supabase.'
        );


        const {
            error: insertError
        } = await supabaseClient
            .from('products')
            .insert([{

                title:
                    title,

                category:
                    category,

                price:
                    Number(price),

                stock:
                    Number(stock),

                emoji:
                    emoji,

                image:
                    selectedProductImage ||
                    null,

                barcode:
                    barcode,

                description:
                    description,

                published:
                    published,

                variants:
                    variants,

                owner_id:
                    user.id

            }]);


        if (insertError) {

            console.error(
                'Supabase product insert failed:',
                insertError
            );

            alert(
                'Product was saved locally, but could not be saved to the online store.\n\n' +
                insertError.message
            );

            return;

        }


        console.log(
            'Product saved to Supabase successfully.'
        );

      syncOdropBarcodeCache(products, user.id);

    }


} catch (error) {

    console.error(
        'Supabase product save error:',
        error
    );

    alert(
        'Online database error:\n\n' +
        (error?.message || error)
    );

    return;

}

        // Save ALL products
        try {

            localStorage.setItem(
                'odropProducts',
                JSON.stringify(products)
            );
        } catch (error) {

            console.error(
                'Could not save product:',
                error
            );

            alert(
                'The product could not be saved. The image may be too large.'
            );

            // Remove the product we just added
            products.pop();

            return;
        }


        console.log(
    editingProductId !== null
        ? 'Product updated successfully:'
        : 'Product created successfully:'
);
        

        // Refresh seller store from Supabase
await renderProducts();


        // Refresh public/customer store
        if (
            typeof renderPublicProducts === 'function'
        ) {
            renderPublicProducts();
        }


        // Reset form
        productForm.reset();


        // Clear selected image
        selectedProductImage = '';
        // Clear edit mode
editingProductId = null;

        // Reset image preview
        if (productUploadPreview) {

            productUploadPreview.innerHTML = `
                <i class="fa-solid fa-image"></i>
                <span>No image selected</span>
            `;

        }


        // Go to Store
        const storeButton =
            document.querySelector(
                '[data-target="storeScreen"]'
            );

        if (storeButton) {

            storeButton.click();

        }


        alert(
            'Product published successfully!'
        );

    });

}


// =========================================
// INVENTORY FILTERS
// =========================================

const inventoryFilters =
    document.querySelectorAll('.inventory-filter');


inventoryFilters.forEach(filterButton => {

    filterButton.addEventListener('click', () => {


        inventoryFilters.forEach(button => {

            button.classList.remove('active');

        });


        filterButton.classList.add('active');


        currentInventoryFilter =
            filterButton.getAttribute('data-filter');


        renderProducts();

    });

});


// =========================================
// PRODUCT SEARCH
// =========================================

const productSearch =
    document.getElementById('productSearch');


if (productSearch) {

    productSearch.addEventListener('input', () => {

        currentSearchTerm =
            productSearch.value
                .toLowerCase()
                .trim();


        renderProducts();

    });

}


// =========================================
// SMALL ADD PRODUCT BUTTON
// =========================================

const addProductButton =
    document.querySelector('.add-product-small');


if (addProductButton) {

    addProductButton.addEventListener('click', () => {

        const postButton =
            document.querySelector(
                '[data-target="postScreen"]'
            );


        if (postButton) {
            postButton.click();
        }

    });

}
// =========================================
// PRODUCT EDIT BUTTONS
// =========================================

if (productGrid) {

    productGrid.addEventListener('click', (event) => {

        const editButton =
            event.target.closest('.product-edit-btn');

        if (!editButton) {
            return;
        }

        const productId =
    editButton.getAttribute(
        'data-product-id'
    );

console.log(
    'PRODUCT EDIT — Button clicked. Product ID:',
    productId
);

        const product =
            products.find(
                item => item.id === productId
            );

        if (!product) {
            return;
        }

        // Remember which product we are editing
editingProductId = product.id;


// Open the real Post New Item navigation button
const postButton =
    document.querySelector(
        '.nav-btn.post-nav-btn[data-target="postScreen"]'
    );

if (postButton) {

    console.log(
        'PRODUCT EDIT — Opening Post New Item screen.'
    );

    postButton.click();

} else {

    console.error(
        'PRODUCT EDIT — Post New Item navigation button not found.'
    );

}


        // Fill the existing product form

        const titleInput =
            document.getElementById(
                'productTitle'
            );

        const categoryInput =
            document.getElementById(
                'productCategory'
            );

        const priceInput =
            document.getElementById(
                'productPrice'
            );

        const stockInput =
            document.getElementById(
                'productStock'
            );

        const emojiInput =
            document.getElementById(
                'productEmoji'
            );

        const barcodeInput =
            document.getElementById(
                'productBarcode'
            );

        const descriptionInput =
            document.getElementById(
                'productDescription'
            );

        const publishedInput =
            document.getElementById(
                'productPublished'
            );


        if (titleInput) {
            titleInput.value =
                product.title || '';
        }

        if (categoryInput) {
            categoryInput.value =
                product.category || '';
        }

        if (priceInput) {
            priceInput.value =
                product.price ?? '';
        }

        if (stockInput) {
            stockInput.value =
                product.stock ?? '';
        }

        if (emojiInput) {
            emojiInput.value =
                product.emoji || '';
        }

        if (barcodeInput) {
            barcodeInput.value =
                product.barcode || '';
        }

        if (descriptionInput) {
            descriptionInput.value =
                product.description || '';
        }

        if (publishedInput) {
            publishedInput.checked =
                product.published !== false;
        }


        // Keep the existing product image

        selectedProductImage =
            product.image || '';

      // Show the existing product image in the preview
if (
    productUploadPreview &&
    product.image
) {

    productUploadPreview.innerHTML = `
        <img
            src="${product.image}"
            alt="${product.title || 'Product image'}"
            style="
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 12px;
            "
        >
    `;

} else if (productUploadPreview) {

    productUploadPreview.innerHTML = `
        <i class="fa-solid fa-image"></i>
        <span>No image selected</span>
    `;

}

    });

}


// =========================================
// BRICK 3 - PRODUCT LIVE PREVIEW
// =========================================

const productTitleInput =
    document.getElementById('productTitle');

const productPriceInput =
    document.getElementById('productPrice');

const productEmojiInput =
    document.getElementById('productEmoji');


const previewName =
    document.getElementById('productPreviewName');

const previewPrice =
    document.getElementById('productPreviewPrice');

const previewImage =
    document.getElementById('productPreviewImage');


if (
    productTitleInput &&
    previewName
) {

    productTitleInput.addEventListener('input', () => {

        previewName.textContent =
            productTitleInput.value.trim() ||
            'Your Product';

    });

}


if (
    productPriceInput &&
    previewPrice
) {

    productPriceInput.addEventListener('input', () => {

        const price =
            Number(productPriceInput.value);


        previewPrice.textContent =
            formatCurrency(
                price > 0
                    ? price
                    : 0
            );

    });

    // C6-E-1 — INITIAL PRODUCT PREVIEW PRICE
    previewPrice.textContent =
        formatCurrency(0);

}


if (
    productEmojiInput &&
    previewImage
) {

    productEmojiInput.addEventListener('input', () => {

        previewImage.textContent =
            productEmojiInput.value.trim() ||
            '🖼️';

    });

}


// =========================================
// INITIAL RENDER
// =========================================

renderProducts();
// =========================================
// PROFILE BRICK 2 - STORE INFORMATION
// =========================================

const storeInformationBtn =
    document.getElementById('storeInformationBtn');

const storeInformationPanel =
    document.getElementById('storeInformationPanel');

const closeStoreInformation =
    document.getElementById('closeStoreInformation');


if (
    storeInformationBtn &&
    storeInformationPanel
) {

    storeInformationBtn.addEventListener('click', () => {

        storeInformationPanel.style.display = 'block';

        const profileMenus =
            document.querySelectorAll(
                '#profileScreen > .profile-section, ' +
                '#profileScreen > .profile-header-card, ' +
                '#profileScreen > .profile-actions, ' +
                '#profileScreen > .merchant-status-card, ' +
                '#profileScreen > .logout-btn'
            );

        profileMenus.forEach(element => {
            element.style.display = 'none';
        });

    });

}


if (closeStoreInformation) {

    closeStoreInformation.addEventListener('click', () => {

        storeInformationPanel.style.display = 'none';

        const profileMenus =
            document.querySelectorAll(
                '#profileScreen > .profile-section, ' +
                '#profileScreen > .profile-header-card, ' +
                '#profileScreen > .profile-actions, ' +
                '#profileScreen > .merchant-status-card, ' +
                '#profileScreen > .logout-btn'
            );

        profileMenus.forEach(element => {
            element.style.display = '';
        });

    });

}
// =========================================
// STORE INFORMATION - SAVE + LOAD
// =========================================

const saveStoreInformation =
    document.getElementById('saveStoreInformation');

const storeNameInput =
    document.getElementById('storeName');

const storeOwnerInput =
    document.getElementById('storeOwner');

const storePhoneInput =
    document.getElementById('storePhone');

const storeEmailInput =
    document.getElementById('storeEmail');

const storeLocationInput =
    document.getElementById('storeLocation');

const storeDescriptionInput =
    document.getElementById('storeDescription');



            // =========================================
// SAVE STORE INFORMATION
// =========================================

if (saveStoreInformation) {

    saveStoreInformation.onclick = async function () {

        const storeInformation = {

            name:
                document.getElementById('storeName')?.value.trim() || '',

            owner:
                document.getElementById('storeOwner')?.value.trim() || '',

            phone:
                document.getElementById('storePhone')?.value.trim() || '',

            email:
                document.getElementById('storeEmail')?.value.trim() || '',

            location:
                document.getElementById('storeLocation')?.value.trim() || '',

            description:
                document.getElementById('storeDescription')?.value.trim() || ''

        };


        try {

            // =========================================
            // GET AUTHENTICATED USER
            // =========================================

            const {
                data: {
                    user
                },
                error: userError
            } = await supabaseClient.auth.getUser();


            if (userError) {

                console.error(
                    'STORE SAVE — Could not get authenticated user:',
                    userError
                );

                throw userError;

            }


            if (!user) {

                console.error(
                    'STORE SAVE — No authenticated user.'
                );

                throw new Error(
                    'No authenticated user.'
                );

            }


            console.log(
                'STORE SAVE — Authenticated user:',
                user.id
            );


            // =========================================
// UPDATE STORE IN SUPABASE
// =========================================

console.log(
    'STORE SAVE — Updating Supabase store:',
    storeInformation
);

  // =========================================
// BRICK G — RESOLVE STORE SLUG BEFORE SAVE
// =========================================

let slugToSave =
    storeSlug;


if (!slugToSave) {

    /*
     * Check Supabase in case the store loader
     * has not finished yet.
     *
     * This prevents an existing store's
     * permanent slug from accidentally being
     * replaced by a newly generated slug.
     */

    const {
        data: existingStore,
        error: existingStoreError
    } = await supabaseClient
        .from('stores')
        .select('slug')
        .eq(
            'owner_id',
            user.id
        )
        .maybeSingle();


    if (existingStoreError) {

        console.error(
            'BRICK G — Could not resolve existing store slug:',
            existingStoreError
        );

        throw existingStoreError;

    }


    if (
        existingStore &&
        existingStore.slug
    ) {

        slugToSave =
            existingStore.slug;

    }

}


/*
 * Brand-new store:
 *
 * Generate its slug once.
 */

if (!slugToSave) {

    slugToSave =
        createStoreSlug(
            storeInformation.name
        );

}


if (!slugToSave) {

    throw new Error(
        'BRICK G — Could not create a valid store slug.'
    );

}


/*
 * Keep the global persistent slug
 * synchronized with what will be saved.
 */

storeSlug =
    slugToSave;


console.log(
    'BRICK G — Store slug prepared for save:',
    storeSlug
);        

const {
    data: savedStore,
    error: storeUpdateError
} = await supabaseClient
    .from('stores')
    .upsert(
        {
            owner_id:
                   user.id,

            slug:
               slugToSave,

            name:
               storeInformation.name,

            phone:
                storeInformation.phone,

            email:
                storeInformation.email,

            location:
                storeInformation.location,

            description:
                storeInformation.description
        },
        {
            onConflict:
                'owner_id'
        }
    )
    .select()
    .single();
          

if (storeUpdateError) {

    console.error(
        'STORE SAVE — Supabase update failed:',
        storeUpdateError
    );

    throw storeUpdateError;

}


console.log(
    'STORE SAVE — Supabase store saved successfully:',
    savedStore
);


            // =========================================
            // SAVE LOCAL COPY
            // =========================================

            localStorage.setItem(
                'odropStoreInformation',
                JSON.stringify(storeInformation)
            );


            // Verify that the browser actually stored it
            const verifyStoreInformation =
                localStorage.getItem(
                    'odropStoreInformation'
                );


            if (!verifyStoreInformation) {

                throw new Error(
                    'Store information was not written to localStorage.'
                );

            }


            console.log(
                'Store Information saved:',
                storeInformation
            );


            // =========================================
            // KEEP GLOBAL STORE NAME UPDATED
            // =========================================

            storeName =
                storeInformation.name;


            // =========================================
            // UPDATE PROFILE STORE NAME
            // =========================================

            const profileStoreName =
                document.querySelector(
                    '.profile-name-row h2'
                );


            if (
                profileStoreName &&
                storeInformation.name
            ) {

                profileStoreName.textContent =
                    storeInformation.name;

            }


            // =========================================
            // SHOW SUCCESS
            // =========================================

            saveStoreInformation.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Saved Successfully
            `;


            setTimeout(() => {

                saveStoreInformation.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Save Store Information
                `;

            }, 2000);


        } catch (error) {

            console.error(
                'Store information could not be saved:',
                error
            );


            alert(
                'Could not save store information.'
            );

        }

    };

}


// =========================================
// LOAD STORE INFORMATION
// =========================================

function loadStoreInformation() {

    const saved =
        localStorage.getItem(
            'odropStoreInformation'
        );

    if (!saved) {
        return;
    }


    let storeInformation;

    try {

        storeInformation =
            JSON.parse(saved);

    } catch (error) {

        console.error(
            'Saved store information is invalid:',
            error
        );

        return;
    }


    if (storeNameInput) {

        storeNameInput.value =
            storeInformation.name || '';

    }


    if (storeOwnerInput) {

        storeOwnerInput.value =
            storeInformation.owner || '';

    }


    if (storePhoneInput) {

        storePhoneInput.value =
            storeInformation.phone || '';

    }


    if (storeEmailInput) {

        storeEmailInput.value =
            storeInformation.email || '';

    }


    if (storeLocationInput) {

        storeLocationInput.value =
            storeInformation.location || '';

    }


    if (storeDescriptionInput) {

        storeDescriptionInput.value =
            storeInformation.description || '';

    }


    // Update profile name

    const profileStoreName =
        document.querySelector(
            '.profile-name-row h2'
        );

    if (
        profileStoreName &&
        storeInformation.name
    ) {

        profileStoreName.textContent =
            storeInformation.name;

    }

}


// Load saved information

loadStoreInformation();

// =========================================
// BRICK SN-1 — RESTORE DASHBOARD STORE NAME
// Show the saved name while Supabase loads
// =========================================

(() => {
    const storeNameElement =
        document.getElementById('storeDisplayName');

    if (!storeNameElement) {
        console.warn(
            'SN-1: storeDisplayName element not found.'
        );
        return;
    }

    try {
        const saved =
            localStorage.getItem('odropStoreInformation');

        if (!saved) {
            console.log(
                'SN-1: No locally saved store information.'
            );
            return;
        }

        const storeInformation = JSON.parse(saved);

        const savedName =
            typeof storeInformation.name === 'string'
                ? storeInformation.name.trim()
                : '';

        if (savedName) {
            storeNameElement.textContent = savedName;

            console.log(
                'SN-1: Restored saved dashboard store name:',
                savedName
            );
        }
    } catch (error) {
        console.error(
            'SN-1: Could not restore saved store name:',
            error
        );
    }
})();

// =========================================
// BRICK 3C — LOAD STORE FROM SUPABASE
// =========================================

async function loadStoreInformationFromSupabase() {

    console.log(
        'BRICK 3C — Loading store from Supabase...'
    );


    // Get the currently authenticated user
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError) {

        console.error(
            'BRICK 3C — Could not get authenticated user:',
            userError
        );

        return;
    }


    if (!user) {

        console.log(
            'BRICK 3C — No authenticated user.'
        );

        return;
    }


    console.log(
        'BRICK 3C — Authenticated user:',
        user.id
    );


    // Load this user's store
    const {
        data: stores,
        error: storeError
    } = await supabaseClient
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1);


    if (storeError) {

        console.error(
            'BRICK 3C — Could not load store:',
            storeError
        );

        return;
    }


    if (!stores || stores.length === 0) {

        console.log(
            'BRICK 3C — No Supabase store found for this user.'
        );

        return;
    }


    const store =
    stores[0];


// =========================================
// BRICK G — RESTORE PERSISTENT STORE SLUG
// =========================================
//
// The database is now the source of truth
// for the public store URL.
// =========================================

currentStoreOwnerId =
    store.owner_id;


storeSlug =
    store.slug || '';


storeName =
    store.name || '';


console.log(
    'BRICK G — Persistent store slug loaded:',
    storeSlug
);


console.log(
    'BRICK G — storeName assigned:',
    storeName
);

  console.log(
    'BRICK 3C — storeName assigned:',
    storeName
);
  
    console.log(
        'BRICK 3C — Store loaded from Supabase:',
        store
    );

  // =========================================
// STORE QR — LOAD SELLER INFORMATION
// BRICK STORE QR 2
// =========================================

const storeQrBusinessName =
    document.getElementById(
        'storeQrBusinessName'
    );

const storeQrPhone =
    document.getElementById(
        'storeQrPhone'
    );

const storeQrLocation =
    document.getElementById(
        'storeQrLocation'
    );

const storeQrEmail =
    document.getElementById(
        'storeQrEmail'
    );


// =========================================
// BUSINESS NAME
// =========================================

if (storeQrBusinessName) {

    storeQrBusinessName.textContent =
        store.name ||
        'Your Store';

}


// =========================================
// PHONE
// =========================================

if (storeQrPhone) {

    storeQrPhone.textContent =
        store.phone ||
        '—';

}


// =========================================
// LOCATION
// =========================================

if (storeQrLocation) {

    storeQrLocation.textContent =
        store.location ||
        '—';

}


// =========================================
// EMAIL
// =========================================

if (storeQrEmail) {

    storeQrEmail.textContent =
        store.email ||
        '—';

}


console.log(
    'BRICK STORE QR 2 — Seller information applied:',
    {
        name: store.name,
        phone: store.phone,
        location: store.location,
        email: store.email
    }
);

// =========================================
// BRICK C5-B
// APPLY SAVED STORE LOGO
// =========================================

applyMainStoreProfileImage(
    store.profile_image_url || ''
);

  
    // Fill the existing Store Information form

    if (storeNameInput) {
        storeNameInput.value =
            store.name || '';
    }


    if (storePhoneInput) {
        storePhoneInput.value =
            store.phone || '';
    }


    if (storeEmailInput) {
        storeEmailInput.value =
            store.email || '';
    }


    if (storeLocationInput) {
        storeLocationInput.value =
            store.location || '';
    }


    if (storeDescriptionInput) {
        storeDescriptionInput.value =
            store.description || '';
    }


    // Update profile/store name on the page

    const profileStoreName =
        document.querySelector(
            '.profile-name-row h2'
        );

const storeLogoElem = document.getElementById('publicStoreLogo');
const storeBannerElem = document.getElementById('publicStoreBanner');
const storeDescElem = document.getElementById('publicStoreDescription');

// Set Logo
if (storeLogoElem && store.profile_image_url) {
    storeLogoElem.src = store.profile_image_url;
}

// Set Cover Banner
if (storeBannerElem && store.cover_image_url) {
    storeBannerElem.style.backgroundImage = `url('${store.cover_image_url}')`;
}

  // =========================================
// C5-G — PUBLIC CUSTOMER BANNER VIDEO
// =========================================

if (
    storeBannerElem &&
    store.cover_video_url
) {

    console.log(
        'BRICK C5-G — Public banner video found:',
        store.cover_video_url
    );

    // Keep the existing cover image underneath
    // as the fallback.
    storeBannerElem.style.position =
        'relative';

    storeBannerElem.style.overflow =
        'hidden';

    // Remove an older injected video if one exists.
    const existingPublicVideo =
        storeBannerElem.querySelector(
            '.public-store-banner-video'
        );

    if (existingPublicVideo) {
        existingPublicVideo.pause();
        existingPublicVideo.remove();
    }

    // Create public banner video.
    const publicBannerVideo =
        document.createElement('video');

    publicBannerVideo.className =
        'public-store-banner-video';

    publicBannerVideo.src =
        store.cover_video_url;

    publicBannerVideo.autoplay =
        true;

    publicBannerVideo.muted =
        true;

    publicBannerVideo.loop =
        true;

    publicBannerVideo.playsInline =
        true;

    publicBannerVideo.controls =
        false;

    publicBannerVideo.preload =
        'auto';

    // Fill the EXISTING banner.
    // Do not create or resize another banner.
    publicBannerVideo.style.position =
        'absolute';

    publicBannerVideo.style.inset =
        '0';

    publicBannerVideo.style.width =
        '100%';

    publicBannerVideo.style.height =
        '100%';

    publicBannerVideo.style.objectFit =
        'cover';

    publicBannerVideo.style.display =
        'block';

    publicBannerVideo.style.zIndex =
        '1';

    publicBannerVideo.style.pointerEvents =
        'none';

    // Put video inside the existing banner.
    storeBannerElem.appendChild(
        publicBannerVideo
    );

    publicBannerVideo.addEventListener(
        'loadeddata',
        () => {

            console.log(
                'BRICK C5-G — Public banner video loaded successfully.'
            );

            publicBannerVideo
                .play()
                .catch(
                    error => {

                        console.warn(
                            'BRICK C5-G — Video play failed:',
                            error
                        );

                    }
                );

        },
        {
            once: true
        }
    );

    publicBannerVideo.addEventListener(
        'error',
        error => {

            console.warn(
                'BRICK C5-G — Public banner video failed. Existing cover image remains as fallback.',
                error
            );

            publicBannerVideo.remove();

        },
        {
            once: true
        }
    );

}

// Set Description
if (storeDescElem && store.description) {
    storeDescElem.textContent = store.description;
}

  

    if (
        profileStoreName &&
        store.name
    ) {

        profileStoreName.textContent =
            store.name;

    }

       const storeNameElement =
    document.getElementById(
        'storeDisplayName'
    );


if (storeNameElement) {

    storeNameElement.textContent =
        store.name || 'My Store';

}
  
    console.log(
        'BRICK 3C — Store information applied to form.'
    );
}


// Run Supabase store loader

loadStoreInformationFromSupabase();


// =========================================
// BRICK INBOX 1 — LOAD NOTIFICATIONS
// =========================================

async function loadNotifications() {

    const notificationList =
        document.getElementById(
            'notificationList'
        );

    if (!notificationList) {
        return;
    }

    const {
        data: { user }
    } =
    await supabaseClient.auth.getUser();

    if (!user) {
        return;
    }

    const {
        data,
        error
    } =
    await supabaseClient
        .from('notifications')
        .select(`
            id,
            type,
            title,
            message,
            icon,
            read,
            created_at
        `)
        .eq(
            'user_id',
            user.id
        )
        .order(
            'created_at',
            {
                ascending: false
            }
        );

    if (error) {

        console.error(
            'NOTIFICATIONS LOAD ERROR:',
            error
        );

        return;
    }

    console.log(
    'NOTIFICATIONS LOADED:',
    data
);

window.notifications = data || [];

const filtered =
    filterNotificationCategories(
        window.notifications,
        activeNotificationCategory
    );

renderNotifications(
    filtered
);

updateNotificationUnreadCount(
    window.notifications
);

}
// =========================================
// BRICK INBOX 2 — RENDER NOTIFICATIONS
// =========================================

function renderNotifications(notifications) {

    const notificationList =
    document.getElementById(
        'notificationsCenterList'
    );


    if (!notificationList) {

        console.error(
            'BRICK INBOX 2 — notificationList not found.'
        );

        return;
    }


    // =====================================
    // EMPTY NOTIFICATIONS
    // =====================================

    if (
        !notifications ||
        notifications.length === 0
    ) {

        notificationList.innerHTML = `

            <div class="notification-empty">

                <div class="notification-empty-icon">
                    <i class="fa-regular fa-bell"></i>
                </div>

                <strong>
                    No notifications yet
                </strong>

                <span>
                    You're all caught up.
                </span>

            </div>

        `;

        return;
    }


    // =====================================
    // RENDER NOTIFICATIONS
    // =====================================

    notificationList.innerHTML =
        notifications.map(notification => {

            const notificationDate =
                notification.created_at
                    ? new Date(
                        notification.created_at
                    ).toLocaleString()
                    : '';


            return `

                <div
                    class="notification-item ${
                        notification.read
                            ? ''
                            : 'unread'
                    }"
                    data-notification-id="${notification.id}"
                >

                    <div class="notification-icon">

                        <i class="${
                            notification.icon ||
                            'fa-regular fa-bell'
                        }"></i>

                    </div>


                    <div class="notification-content">

                        <strong>
                            ${
                                notification.title ||
                                'Notification'
                            }
                        </strong>

                        <p>
                            ${
                                notification.message ||
                                ''
                            }
                        </p>

                        <small>
                            ${notificationDate}
                        </small>

                    </div>

                </div>

            `;

        }).join('');


    console.log(
        'BRICK INBOX 2 — Notifications rendered:',
        notifications
    );

}

// =========================================
// BRICK INBOX 10 — LOAD SELLER CONVERSATIONS
// =========================================

async function loadSellerConversations() {

    console.log(
        'BRICK INBOX 10 — Loading seller conversations...'
    );


    // =====================================
    // GET AUTHENTICATED USER
    // =====================================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            'BRICK INBOX 10 — Could not get authenticated user:',
            userError
        );

        return [];

    }


    console.log(
        'BRICK INBOX 10 — Seller ID:',
        user.id
    );


    // =====================================
    // LOAD CONVERSATIONS
    // =====================================

    const {
        data: conversations,
        error: conversationsError
    } =
        await supabaseClient
            .from('conversations')
            .select(
                'id, buyer_id, seller_id, created_at, updated_at'
            )
            .eq(
                'seller_id',
                user.id
            )
            .order(
                'updated_at',
                {
                    ascending: false
                }
            );


    if (conversationsError) {

        console.error(
            'BRICK INBOX 10 — Conversations load failed:',
            conversationsError
        );

        return [];

    }


    console.log(
        'BRICK INBOX 10 — Conversations loaded:',
        conversations
    );


    return conversations || [];

}

// =========================================
// BRICK INBOX 10 — TEST CONVERSATION LOAD
// =========================================

loadSellerConversations()
    .then(
        conversations => {

            renderSellerConversations(
                conversations
            );

        }
    );

// =========================================
// BRICK INBOX 11 — RENDER CHAT CONVERSATIONS
// =========================================

function renderSellerConversations(conversations) {


     const chatList =
    document.getElementById(
        'notificationList'
    );
  
    if (!chatList) {

        console.error(
            'BRICK INBOX 11 — Chat list container not found.'
        );

        return;
    }


    // Clear current Chat content
    chatList.innerHTML = '';


    // Empty state
    if (!conversations || conversations.length === 0) {

        chatList.innerHTML = `
            <div class="notification-empty-state">
                <i class="fa-regular fa-comments"></i>

                <p>No customer conversations yet.</p>

                <span>
                    Customer messages will appear here.
                </span>
            </div>
        `;

        console.log(
            'BRICK INBOX 11 — No conversations to render.'
        );

        return;
    }


    // Render conversations
    conversations.forEach(conversation => {

        const conversationCard =
            document.createElement('div');

        conversationCard.className =
            'chat-conversation-card';


        conversationCard.dataset.conversationId =
            conversation.id;

      conversationCard.dataset.buyerId =
    conversation.buyer_id;


        conversationCard.innerHTML = `

            <div class="chat-conversation-icon">

                <i class="fa-regular fa-user"></i>

            </div>


            <div class="chat-conversation-content">

                <div class="chat-conversation-title">

                    Customer

                </div>


                <div class="chat-conversation-preview">

                    Open conversation

                </div>

            </div>


            <div class="chat-conversation-time">

                ${conversation.updated_at
                    ? new Date(
                        conversation.updated_at
                    ).toLocaleTimeString(
                        [],
                        {
                            hour: '2-digit',
                            minute: '2-digit'
                        }
                    )
                    : ''
                }

            </div>

        `;


        chatList.appendChild(
            conversationCard
        );

    });


    console.log(
        'BRICK INBOX 11 — Conversations rendered:',
        conversations
    );

}

// =========================================
// BRICK INBOX 8 — CATEGORY FILTERS
// =========================================

let activeNotificationFilter = 'all';


function filterNotifications(
    notifications,
    filter
) {

        if (filter === 'all') {

        return notifications;

    }
  
    if (filter === 'unread') {

        return notifications.filter(
            notification =>
                notification.read === false
        );

    }



    if (filter === 'chat') {

        return notifications.filter(
            notification =>
                notification.type === 'chat'
        );

    }



    if (filter === 'pending') {

    return notifications.filter(
        notification =>
            notification.status === 'pending' ||
            notification.type === 'pending'
    );

}


if (filter === 'fulfilled') {

    return notifications.filter(
        notification =>
            notification.status === 'fulfilled' ||
            notification.type === 'fulfilled'
    );

}



    return notifications;

}


document.querySelectorAll(
    '[data-notification-filter]'
)
.forEach(button => {


    button.addEventListener(
        'click',
        () => {


            // =========================================
            // BRICK INBOX 8A — ACTIVE TAB UI STATE
            // =========================================

            document.querySelectorAll(
                '[data-notification-filter]'
            )
            .forEach(tab => {

                tab.classList.remove(
                    'active'
                );

            });


            button.classList.add(
                'active'
            );


            // =========================================
            // BRICK INBOX 8 — APPLY FILTER
            // =========================================

            activeNotificationFilter =
                button.dataset.notificationFilter;


            const filtered =
                filterNotifications(
                    window.notifications || [],
                    activeNotificationFilter
                );


            renderNotifications(
                filtered
            );


            console.log(
                'BRICK INBOX 8 — Filter applied:',
                activeNotificationFilter,
                filtered
            );

        }
    );


});

// =========================================
// NOTIFICATION CENTER CATEGORY FILTERS
// BRICK NOTIFICATION 1
// =========================================

let activeNotificationCategory = 'all';


function filterNotificationCategories(
    notifications,
    category
) {

    if (
        category === 'all'
    ) {

        return notifications;

    }


    return notifications.filter(
        notification => {

            const type =
                String(
                    notification.type || ''
                ).toLowerCase();


            switch (category) {

                case 'inventory':

                    return type === 'inventory';


                case 'sales':

                    return (
                        type === 'sale' ||
                        type === 'sales'
                    );


                case 'account':

                    return type === 'account';


                case 'store':

                    return type === 'store';


                case 'system':

                    return (
                        type === 'system' ||
                        type === 'general'
                    );


                default:

                    return false;

            }

        }
    );

}


// =========================================
// CATEGORY BUTTON EVENTS
// =========================================

document.querySelectorAll(
    '[data-notification-category]'
)
.forEach(button => {

    button.addEventListener(
        'click',
        () => {

            // Remove active state
            // from notification categories

            document.querySelectorAll(
                '[data-notification-category]'
            )
            .forEach(categoryButton => {

                categoryButton.classList.remove(
                    'active'
                );

            });


            // Activate clicked category

            button.classList.add(
                'active'
            );


            // Save selected category

            activeNotificationCategory =
                button.dataset.notificationCategory;


            // Filter current notifications

            const filtered =
                filterNotificationCategories(
                    window.notifications || [],
                    activeNotificationCategory
                );


            // Render filtered notifications

            renderNotifications(
                filtered
            );


            console.log(
                'BRICK NOTIFICATION 1 — Category applied:',
                activeNotificationCategory,
                filtered
            );

        }
    );

});


// =========================================
// BRICK INBOX 4 — UNREAD COUNT + MARK READ
// =========================================

function updateNotificationUnreadCount(
    notifications
) {

    const unreadText =
        document.getElementById(
            'notificationUnreadText'
        );


    if (!unreadText) {

        console.error(
            'BRICK INBOX 4 — notificationUnreadText not found.'
        );

        return;
    }


    const unreadCount =
        (notifications || []).filter(
            notification =>
                notification.read === false
        ).length;


    if (unreadCount === 0) {

        unreadText.textContent =
            'No unread notifications';

        return;
    }


    unreadText.textContent =
        unreadCount === 1
            ? '1 unread notification'
            : `${unreadCount} unread notifications`;


    console.log(
        'BRICK INBOX 4 — Unread notifications:',
        unreadCount
    );

}


// =========================================
// MARK ALL NOTIFICATIONS AS READ
// =========================================

async function markAllNotificationsRead() {

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            'BRICK INBOX 4 — User not found:',
            userError
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from('notifications')
            .update({
                read: true
            })
            .eq(
                'user_id',
                user.id
            )
            .eq(
                'read',
                false
            );


    if (error) {

        console.error(
            'BRICK INBOX 4 — Could not mark notifications as read:',
            error
        );

        return;
    }


    console.log(
        'BRICK INBOX 4 — All notifications marked as read.'
    );


    // Refresh notification list
    await loadNotifications();

}

// =========================================
// MARK READ BUTTON
// =========================================

const markNotificationsReadBtn =
    document.getElementById(
        'markNotificationsReadBtn'
    );


if (markNotificationsReadBtn) {

    markNotificationsReadBtn.addEventListener(
        'click',
        () => {

            markAllNotificationsRead();

        }
    );

}

// =========================================
// BRICK INBOX 5 — REAL-TIME NOTIFICATIONS
// =========================================

let notificationsChannel = null;


async function startNotificationsRealtime() {

    // =====================================
    // GET AUTHENTICATED USER
    // =====================================

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            'BRICK INBOX 5 — User not found:',
            userError
        );

        return;
    }


    // =====================================
    // PREVENT DUPLICATE CHANNELS
    // =====================================

    if (notificationsChannel) {

        console.log(
            'BRICK INBOX 5 — Realtime already running.'
        );

        return;
    }


    // =====================================
    // CREATE REALTIME CHANNEL
    // =====================================

    notificationsChannel =
        supabaseClient
            .channel(
                `notifications-${user.id}`
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter:
                        `user_id=eq.${user.id}`
                },
                async (payload) => {

                    console.log(
                        'BRICK INBOX 5 — New notification received:',
                        payload.new
                    );


                    // Reload notifications
                    // so the existing renderer
                    // stays the single source of UI truth.

                    await loadNotifications();

                }
            )
            .subscribe(
                (status, error) => {

                    console.log(
                        'BRICK INBOX 5 — Realtime status:',
                        status
                    );


                    if (
                        status ===
                            'CHANNEL_ERROR' ||
                        status ===
                            'TIMED_OUT'
                    ) {

                        console.error(
                            'BRICK INBOX 5 — Realtime error:',
                            error
                        );

                    }

                }
            );

}

startNotificationsRealtime();

// =========================================
// BRICK INBOX 3 — CREATE NOTIFICATION
// =========================================

async function createNotification({
    type = 'general',
    title = 'New Notification',
    message = '',
    icon = 'fa-regular fa-bell'
} = {}) {

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            'BRICK INBOX 3 — User not found:',
            userError
        );

        return false;
    }


    const {
        error
    } =
        await supabaseClient
            .from('notifications')
            .insert({

                user_id:
                    user.id,

                type:
                    type,

                title:
                    title,

                message:
                    message,

                icon:
                    icon,

                read:
                    false

            });


    if (error) {

        console.error(
            'BRICK INBOX 3 — Notification creation failed:',
            error
        );

        return false;
    }


    console.log(
        'BRICK INBOX 3 — Notification created:',
        {
            type,
            title,
            message
        }
    );


    return true;
}

// =========================================
// BRICK H — PERSISTENT SELLER CHAT
// =========================================
//
// Uses existing Supabase tables:
//
// conversations
// messages
//
// messages columns:
//
// id
// conversation_id
// sender_id
// receiver_id
// message
// read
// created_at
// =========================================

const chatPanel =
    document.getElementById(
        'chatPanel'
    );

const closeChatBtn =
    document.getElementById(
        'closeChatBtn'
    );

const chatCustomerName =
    document.getElementById(
        'chatCustomerName'
    );

const chatAvatar =
    document.getElementById(
        'chatAvatar'
    );

const chatMessages =
    document.getElementById(
        'chatMessages'
    );

const chatMessageInput =
    document.getElementById(
        'chatMessageInput'
    );

const sendChatMessage =
    document.getElementById(
        'sendChatMessage'
    );

const sellerChatList =
    document.getElementById(
        'notificationList'
    );

const appBody =
    document.querySelector(
        '.app-body'
    );


// =========================================
// CURRENT SELLER CONVERSATION
// =========================================

let currentSellerConversationId =
    null;

let currentSellerConversationBuyerId =
    null;

// BRICK H2-A — Prevent stale message loads.
let sellerMessagesLoadToken = 0;

// BRICK N1 — Realtime messages for the active seller conversation
let sellerMessagesRealtimeChannel = null;

function subscribeToSellerConversationMessages(conversationId) {
    if (!conversationId) {
        console.warn(
            'BRICK N1 — Cannot subscribe: conversation ID is missing.'
        );
        return;
    }

    // Remove the previous conversation listener.
    if (sellerMessagesRealtimeChannel) {
        supabaseClient.removeChannel(
            sellerMessagesRealtimeChannel
        );

        sellerMessagesRealtimeChannel = null;
    }

    const subscribedConversationId =
        String(conversationId);

    sellerMessagesRealtimeChannel =
        supabaseClient
            .channel(
                `seller-chat-${subscribedConversationId}`
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter:
                        `conversation_id=eq.${subscribedConversationId}`
                },
                payload => {
                    const newMessage =
                        payload.new;

                    // Ignore events if the seller has changed chats.
                    if (
                        String(currentSellerConversationId) !==
                        String(newMessage.conversation_id)
                    ) {
                        return;
                    }

                    // The seller's own sent message is already handled
                    // by sendSellerMessage() and its message reload.
                    if (
                        String(newMessage.sender_id) !==
                        String(currentSellerConversationBuyerId)
                    ) {
                        return;
                    }

                    console.log(
                        'BRICK N1 — Customer message received:',
                        newMessage.id
                    );

                    // Reload the current conversation so its existing
                    // rendering and read-status logic stays in use.
                    loadSellerMessages(
                        currentSellerConversationId
                    );
                }
            )
            .subscribe(status => {
                console.log(
                    'BRICK N1 — Realtime subscription status:',
                    status
                );

                if (status === 'SUBSCRIBED') {
                    console.log(
                        'BRICK N1 — Listening for customer messages:',
                        subscribedConversationId
                    );
                }

                if (
                    status === 'CHANNEL_ERROR' ||
                    status === 'TIMED_OUT'
                ) {
                    console.error(
                        'BRICK N1 — Realtime connection issue:',
                        status
                    );
                }
            });
}

// =========================================
// LOAD MESSAGES
// =========================================

async function loadSellerMessages(
    conversationId
) {

    if (
        !conversationId ||
        !chatMessages
    ) {
        return;
    }


    console.log(
        'BRICK H — Loading seller messages:',
        conversationId
    );

      // BRICK H2-B — Identify this message-loading request.
    const loadToken = ++sellerMessagesLoadToken;


    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !user
    ) {

        console.error(
            'BRICK H — Seller authentication failed:',
            userError
        );

        return;
    }

      // BRICK H2-C — Ignore outdated requests after authentication.
    if (
        loadToken !== sellerMessagesLoadToken ||
        String(conversationId) !==
            String(currentSellerConversationId)
    ) {
        return;
    }


    const {
        data: messages,
        error
    } =
        await supabaseClient
            .from('messages')
            .select(`
                id,
                conversation_id,
                sender_id,
                receiver_id,
                message,
                read,
                created_at
            `)
            .eq(
                'conversation_id',
                conversationId
            )
            .order(
                'created_at',
                {
                    ascending: true
                }
            );

    
    // BRICK H2-D — Ignore outdated message query results.
    if (
        loadToken !== sellerMessagesLoadToken ||
        String(conversationId) !==
            String(currentSellerConversationId)
    ) {
        return;
    }

    if (error) {

        console.error(
            'BRICK H — Seller messages load failed:',
            error
        );

        return;
    }


    // Clear current messages.
    chatMessages.innerHTML = '';


    if (
        !messages ||
        messages.length === 0
    ) {

        const emptyMessage =
            document.createElement(
                'div'
            );

        emptyMessage.className =
            'chat-date';

        emptyMessage.textContent =
            'Start of conversation';

        chatMessages.appendChild(
            emptyMessage
        );

        return;
    }


    messages.forEach(
        messageRecord => {

            const row =
                document.createElement(
                    'div'
                );


            const isSeller =
                String(
                    messageRecord.sender_id
                ) ===
                String(
                    user.id
                );


            row.className =
                isSeller
                    ? 'message-row seller-message'
                    : 'message-row customer-message';


            const bubble =
                document.createElement(
                    'div'
                );

            bubble.className =
                'message-bubble';

            // BRICK C9-F — Render seller-side product attachments.
const rawMessage = String(messageRecord.message || '');

const attachmentStart = '[NEXODRA_PRODUCT_ATTACHMENT]';
const attachmentEnd = '[/NEXODRA_PRODUCT_ATTACHMENT]';

const startIndex = rawMessage.indexOf(attachmentStart);
const endIndex = startIndex === -1
    ? -1
    : rawMessage.indexOf(
        attachmentEnd,
        startIndex + attachmentStart.length
    );

let attachmentRendered = false;

if (startIndex !== -1 && endIndex !== -1) {
    try {
        const jsonStart = startIndex + attachmentStart.length;
        const jsonText = rawMessage.slice(jsonStart, endIndex);
        const product = JSON.parse(jsonText);

        const card = document.createElement('div');

        Object.assign(card.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            margin: '4px 0 8px',
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            maxWidth: '100%',
            boxSizing: 'border-box'
        });

        const imageBox = document.createElement('div');

        Object.assign(imageBox.style, {
            width: '96px',
            height: '96px',
            minWidth: '96px',
            borderRadius: '12px',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontSize: '36px'
        });

        const imageValue = typeof product.image === 'string'
            ? product.image.trim()
            : '';

        if (/^(https?:\/\/|data:image\/)/i.test(imageValue)) {
            const img = document.createElement('img');

            img.src = imageValue;
            img.alt = product.title || 'Shared product';
            img.loading = 'lazy';

            Object.assign(img.style, {
                width: '100%',
                height: '100%',
                objectFit: 'contain'
            });

            img.onerror = () => {
                img.remove();
                imageBox.textContent = product.emoji || '📦';
            };

            imageBox.appendChild(img);
        } else {
            imageBox.textContent = product.emoji || '📦';
        }

        const details = document.createElement('div');

        Object.assign(details.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            minWidth: '0',
            overflowWrap: 'anywhere'
        });

        const label = document.createElement('span');
        label.textContent = 'SHARED PRODUCT';

        Object.assign(label.style, {
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.7px',
            color: '#64748b'
        });

        const title = document.createElement('strong');
        title.textContent = product.title || 'Untitled Product';

        Object.assign(title.style, {
            fontSize: '16px',
            lineHeight: '1.3',
            color: '#111827'
        });

        const price = document.createElement('span');
        const numericPrice = Number(product.price);

        price.textContent = Number.isFinite(numericPrice)
            ? formatCurrency(numericPrice)
            : '';

        Object.assign(price.style, {
            fontSize: '16px',
            fontWeight: '700',
            color: '#4f46e5'
        });

        details.append(label, title, price);
        card.append(imageBox, details);

        bubble.appendChild(card);

        const visibleMessage = (
            rawMessage.slice(0, startIndex) +
            rawMessage.slice(endIndex + attachmentEnd.length)
        ).trim();

        if (visibleMessage) {
            const text = document.createElement('div');
            text.textContent = visibleMessage;
            bubble.appendChild(text);
        }

        attachmentRendered = true;
    } catch (error) {
        console.warn(
            'BRICK C9-F — Seller product attachment could not be parsed:',
            error
        );
    }
}

if (!attachmentRendered) {
    bubble.textContent = rawMessage;
}


            const time =
                document.createElement(
                    'span'
                );

            time.className =
                'message-time';

            time.textContent =
                messageRecord.created_at
                    ? new Date(
                        messageRecord.created_at
                    ).toLocaleTimeString(
                        [],
                        {
                            hour: '2-digit',
                            minute: '2-digit'
                        }
                    )
                    : '';


            row.appendChild(
                bubble
            );

            row.appendChild(
                time
            );

            chatMessages.appendChild(
                row
            );

        }
    );


    // Mark incoming messages as read.
    const unreadMessages =
        messages.filter(
            messageRecord =>
                String(
                    messageRecord.receiver_id
                ) ===
                String(
                    user.id
                ) &&
                messageRecord.read === false
        );


    for (
        const messageRecord
        of unreadMessages
    ) {

      
        // BRICK H2-E — Stop outdated requests.
        if (
            loadToken !== sellerMessagesLoadToken ||
            String(conversationId) !==
                String(currentSellerConversationId)
        ) {
            return;
        }

        const {
            error: readError
        } =
            await supabaseClient
                .from('messages')
                .update({
                    read: true
                })
                .eq(
                    'id',
                    messageRecord.id
                )
                .eq(
                    'receiver_id',
                    user.id
                );


        if (readError) {

            console.warn(
                'BRICK H — Could not mark message as read:',
                readError
            );

        }

    }


    chatMessages.scrollTop =
        chatMessages.scrollHeight;


    console.log(
        'BRICK H — Seller messages loaded:',
        messages.length
    );

}


// =========================================
// OPEN SELLER CONVERSATION
// =========================================

async function openSellerConversation(
    conversationId,
    buyerId
) {

    if (!conversationId) {
        return;
    }


    currentSellerConversationId =
        conversationId;

    currentSellerConversationBuyerId =
        buyerId || null;


    console.log(
        'BRICK H — Opening seller conversation:',
        {
            conversationId,
            buyerId
        }
    );


    // Hide inbox list.
    const inboxHeader =
        document.querySelector(
            '.inbox-header'
        );

    const inboxSearchBox =
        document.querySelector(
            '.inbox-search'
        );

    const inboxFilterBar =
        document.querySelector(
            '.inbox-filters'
        );


    if (inboxHeader) {
        inboxHeader.style.display =
            'none';
    }

    if (inboxSearchBox) {
        inboxSearchBox.style.display =
            'none';
    }

    if (inboxFilterBar) {

    inboxFilterBar.style.display =
        'none';

}


/* =====================================
   BRICK D — HIDE INBOX TABS
===================================== */

const inboxTabs =
    document.querySelector(
        '.inbox-tabs'
    );

if (inboxTabs) {

    inboxTabs.style.display =
        'none';

}


if (sellerChatList) {

    sellerChatList.style.display =
        'none';

}


// Show chat.
if (chatPanel) {

    chatPanel.style.display =
        'flex';

}

  if (appBody) {

    appBody.classList.add(
        'chat-open'
    );

}


    if (chatCustomerName) {

        chatCustomerName.textContent =
            'Customer';

    }


    if (chatAvatar) {

        chatAvatar.textContent =
            'C';

    }

  // BRICK H1 — Clear the previous chat immediately.
    if (chatMessages) {

        chatMessages.innerHTML = '';

        const loadingMessage =
            document.createElement('div');

        loadingMessage.className = 'chat-date';

        loadingMessage.textContent =
            'Loading messages...';

        chatMessages.appendChild(
            loadingMessage
        );

    }

    // BRICK N1 — Load history, then listen for new messages.
await loadSellerMessages(
    conversationId
);

subscribeToSellerConversationMessages(
    conversationId
);

}


// =========================================
// CLOSE SELLER CONVERSATION
// =========================================

if (closeChatBtn) {

    closeChatBtn.addEventListener(
        'click',
        () => {

            // BRICK N1 — Stop listening when leaving the conversation.
if (sellerMessagesRealtimeChannel) {
    supabaseClient.removeChannel(
        sellerMessagesRealtimeChannel
    );

    sellerMessagesRealtimeChannel = null;
}

// Clear the active conversation.
currentSellerConversationId =
    null;

currentSellerConversationBuyerId =
    null;


            if (chatPanel) {

                chatPanel.style.display =
                    'none';

            }

          if (appBody) {

    appBody.classList.remove(
        'chat-open'
    );

}


            if (sellerChatList) {

                sellerChatList.style.display =
                    '';

            }


            const inboxHeader =
                document.querySelector(
                    '.inbox-header'
                );

            const inboxSearchBox =
                document.querySelector(
                    '.inbox-search'
                );

            const inboxFilterBar =
                document.querySelector(
                    '.inbox-filters'
                );


            if (inboxHeader) {
                inboxHeader.style.display =
                    '';
            }

            if (inboxSearchBox) {
                inboxSearchBox.style.display =
                    '';
            }

            if (inboxFilterBar) {
                inboxFilterBar.style.display =
                    '';
            }

          /* =====================================
   BRICK D — RESTORE INBOX TABS
===================================== */

const inboxTabs =
    document.querySelector(
        '.inbox-tabs'
    );

if (inboxTabs) {

    inboxTabs.style.display =
        '';

}

        }
    );

}


// =========================================
// SELLER SEND MESSAGE
// =========================================

async function sendSellerMessage() {

    if (
        !chatMessageInput ||
        !chatMessages ||
        !currentSellerConversationId
    ) {

        return;

    }


    const message =
        chatMessageInput.value.trim();


    if (!message) {
        return;
    }


    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (
        userError ||
        !user
    ) {

        console.error(
            'BRICK H — Seller authentication failed:',
            userError
        );

        alert(
            'Your session has expired. Please sign in again.'
        );

        return;
    }


    if (
        !currentSellerConversationBuyerId
    ) {

        console.error(
            'BRICK H — No buyer ID for current conversation.'
        );

        return;
    }


    if (
        String(user.id) ===
        String(currentSellerConversationBuyerId)
    ) {

        console.error(
            'BRICK H — Seller and buyer IDs are identical.'
        );

        return;
    }


    if (sendChatMessage) {

        sendChatMessage.disabled =
            true;

    }


    try {

        const {
            data: insertedMessage,
            error
        } =
            await supabaseClient
                .from('messages')
                .insert({
                    conversation_id:
                        currentSellerConversationId,

                    sender_id:
                        user.id,

                    receiver_id:
                        currentSellerConversationBuyerId,

                    message:
                        message,

                    read:
                        false
                })
                .select()
                .single();


        if (error) {

            console.error(
                'BRICK H — Seller message insert failed:',
                error
            );

            alert(
                'Message could not be sent.\n\n' +
                error.message
            );

            return;
        }


        // Update conversation activity.
        const {
            error: conversationUpdateError
        } =
            await supabaseClient
                .from('conversations')
                .update({
                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    'id',
                    currentSellerConversationId
                );


        if (conversationUpdateError) {

            console.warn(
                'BRICK H — Conversation timestamp update failed:',
                conversationUpdateError
            );

        }


        // Clear input.
        chatMessageInput.value =
            '';


        // Reload from database.
        await loadSellerMessages(
            currentSellerConversationId
        );


        console.log(
            'BRICK H — Seller message sent:',
            insertedMessage
        );


    } finally {

        if (sendChatMessage) {

            sendChatMessage.disabled =
                false;

        }

    }

}


if (sendChatMessage) {

    sendChatMessage.addEventListener(
        'click',
        sendSellerMessage
    );

}


if (chatMessageInput) {

    chatMessageInput.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Enter' &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendSellerMessage();

            }

        }
    );

}


// =========================================
// SELLER CONVERSATION CARD CLICK
// =========================================
//
// renderSellerConversations()
// creates .chat-conversation-card
// dynamically, so use event delegation.
// =========================================

if (sellerChatList) {

    sellerChatList.addEventListener(
        'click',
        event => {

            const card =
                event.target.closest(
                    '.chat-conversation-card'
                );


            if (!card) {
                return;
            }


            const conversationId =
                card.dataset.conversationId;


            const buyerId =
                card.dataset.buyerId;


            if (!conversationId) {

                return;

            }


            openSellerConversation(
                conversationId,
                buyerId
            );

        }
    );

}



// =========================================
// PUBLIC STORE SHARE - BRICK 1
// =========================================

const shareStoreBtn =
    document.getElementById('shareStoreBtn');

const storeSharePanel =
    document.getElementById('storeSharePanel');

const closeSharePanel =
    document.getElementById('closeSharePanel');

const publicStoreLink =
    document.getElementById('publicStoreLink');

const copyStoreLinkBtn =
    document.getElementById('copyStoreLinkBtn');

const nativeShareBtn =
    document.getElementById('nativeShareBtn');

let generatedStoreLink = '';

const whatsappShareBtn =
    document.getElementById('whatsappShareBtn');


/*
 * Create the er's public store ID.
 */

// =========================================
// BRICK G — PERSISTENT STORE SLUG
// =========================================
//
// storeName = display name
//
// storeSlug = permanent public URL slug
//
// IMPORTANT:
// storeSlug comes from Supabase once a store
// already exists. It must NOT be regenerated
// every time the store name changes.
// =========================================

let storeName = '';

let storeSlug = '';


function createStoreSlug(
    name
) {

    return String(
        name || ''
    )
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            '-'
        )
        .replace(
            /^-+|-+$/g,
            ''
        );

}


function getStoreSlug() {

    /*
     * Existing store:
     *
     * Use the persistent Supabase slug.
     */

    if (storeSlug) {

        return storeSlug;

    }


    /*
     * New store:
     *
     * Generate a slug from the current
     * store name.
     *
     * This value will be saved to Supabase
     * by the Store Save operation.
     */

    return createStoreSlug(
        storeName
    );

}


/*
 * For now this creates the public-store
 * address structure.
 */

function getGeneratedStoreLink() {

    const persistentSlug =
        getStoreSlug();


    if (!persistentSlug) {

        console.warn(
            'BRICK G — Cannot generate store link because no store slug exists.'
        );

        return '';

    }


    return (
        window.location.origin +
        '/nexodra-seller-app/store/' +
        persistentSlug
    );

}

// =========================================
// STORE QR CODE GENERATOR
// BRICK STORE QR 3
// =========================================

let storeQrLibraryPromise = null;


// =========================================
// LOAD QR GENERATOR LIBRARY
// =========================================

function loadStoreQrLibrary() {

    if (window.QRCode) {

        return Promise.resolve();

    }


    if (storeQrLibraryPromise) {

        return storeQrLibraryPromise;

    }


    storeQrLibraryPromise =
        new Promise((resolve, reject) => {

            const existingScript =
                document.querySelector(
                    'script[data-nexodra-qr-generator]'
                );


            if (existingScript) {

                existingScript.addEventListener(
                    'load',
                    resolve,
                    { once: true }
                );

                existingScript.addEventListener(
                    'error',
                    reject,
                    { once: true }
                );

                return;

            }


            const script =
                document.createElement('script');

            script.src =
                'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

            script.async = true;

            script.dataset.nexodraQrGenerator =
                'true';


            script.onload = () => {

                console.log(
                    'BRICK STORE QR 3 — QR generator loaded.'
                );

                resolve();

            };


            script.onerror = () => {

                console.error(
                    'BRICK STORE QR 3 — Failed to load QR generator.'
                );

                reject(
                    new Error(
                        'QR generator could not be loaded.'
                    )
                );

            };


            document.head.appendChild(
                script
            );

        });


    return storeQrLibraryPromise;

}


// =========================================
// GENERATE STORE QR
// =========================================

async function generateStoreQrCode() {

    const qrContainer =
        document.getElementById(
            'storeQrCode'
        );


    if (!qrContainer) {

        console.error(
            'BRICK STORE QR 3 — QR container not found.'
        );

        return;

    }


    const storeLink =
        getGeneratedStoreLink();


    if (!storeLink) {

        console.warn(
            'BRICK STORE QR 3 — No store link available.'
        );

        qrContainer.innerHTML = `
            <i class="fa-solid fa-link-slash"></i>
        `;

        return;

    }


    try {

        await loadStoreQrLibrary();


        if (!window.QRCode) {

            throw new Error(
                'QRCode library is unavailable.'
            );

        }


        qrContainer.innerHTML = '';


        new QRCode(
            qrContainer,
            {
                text: storeLink,

                width: 250,

                height: 250,

                colorDark: '#111214',

                colorLight: '#ffffff',

                correctLevel:
                    QRCode.CorrectLevel.H
            }
        );


        console.log(
            'BRICK STORE QR 3 — QR generated successfully:',
            storeLink
        );


    } catch (error) {

        console.error(
            'BRICK STORE QR 3 — QR generation failed:',
            error
        );


        qrContainer.innerHTML = `
            <div
                style="
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    gap:8px;
                    text-align:center;
                    padding:20px;
                "
            >
                <i class="fa-solid fa-triangle-exclamation"></i>

                <span>
                    QR unavailable
                </span>
            </div>
        `;

    }

}


// =========================================
// STORE QR DOWNLOAD
// BRICK STORE QR 4
// =========================================

const downloadStoreQrBtn =
    document.getElementById(
        'downloadStoreQrBtn'
    );


if (downloadStoreQrBtn) {

    downloadStoreQrBtn.addEventListener(
        'click',
        async () => {

            const qrContainer =
                document.getElementById(
                    'storeQrCode'
                );


            if (!qrContainer) {

                console.error(
                    'BRICK STORE QR 4 — QR container not found.'
                );

                return;

            }


            /*
             * QRCode.js may create either
             * a canvas or an image.
             */

            const qrCanvas =
                qrContainer.querySelector(
                    'canvas'
                );

            const qrImage =
                qrContainer.querySelector(
                    'img'
                );


            let downloadUrl = '';


            // =====================================
            // CANVAS QR
            // =====================================

            if (qrCanvas) {

                const exportCanvas =
                    document.createElement(
                        'canvas'
                    );

                const padding = 24;

                exportCanvas.width =
                    qrCanvas.width +
                    padding * 2;

                exportCanvas.height =
                    qrCanvas.height +
                    padding * 2;


                const context =
                    exportCanvas.getContext(
                        '2d'
                    );


                context.fillStyle =
                    '#ffffff';

                context.fillRect(
                    0,
                    0,
                    exportCanvas.width,
                    exportCanvas.height
                );


                context.drawImage(
                    qrCanvas,
                    padding,
                    padding
                );


                downloadUrl =
                    exportCanvas.toDataURL(
                        'image/png'
                    );

            }


            // =====================================
            // IMAGE QR
            // =====================================

            else if (qrImage) {

                const exportCanvas =
                    document.createElement(
                        'canvas'
                    );

                const padding = 24;

                exportCanvas.width =
                    qrImage.naturalWidth +
                    padding * 2;

                exportCanvas.height =
                    qrImage.naturalHeight +
                    padding * 2;


                const context =
                    exportCanvas.getContext(
                        '2d'
                    );


                context.fillStyle =
                    '#ffffff';

                context.fillRect(
                    0,
                    0,
                    exportCanvas.width,
                    exportCanvas.height
                );


                context.drawImage(
                    qrImage,
                    padding,
                    padding
                );


                downloadUrl =
                    exportCanvas.toDataURL(
                        'image/png'
                    );

            }


            if (!downloadUrl) {

                console.error(
                    'BRICK STORE QR 4 — No generated QR found.'
                );

                alert(
                    'Please wait for the QR code to finish generating.'
                );

                return;

            }


            // =====================================
            // FILE NAME
            // =====================================

            const storeName =
                (
                    document.getElementById(
                        'storeQrBusinessName'
                    )?.textContent ||
                    'Nexodra-Store'
                )
                .trim()
                .replace(
                    /[^a-z0-9]+/gi,
                    '-'
                )
                .replace(
                    /^-+|-+$/g,
                    ''
                );


            const fileName =
                `${storeName || 'Nexodra-Store'}-QR.png`;

        // =====================================
// NATIVE QR SHARE / SAVE
// BRICK STORE QR 4 — FINAL EXPORT
// =====================================

if (!downloadUrl) {

    alert(
        'Please wait for the QR code to finish generating.'
    );

    return;

}


try {

    // Convert the QR data URL into a Blob.
    const response =
        await fetch(downloadUrl);

    const qrBlob =
        await response.blob();


    const qrFile =
        new File(
            [qrBlob],
            fileName,
            {
                type: 'image/png'
            }
        );


    // =====================================
    // USE NATIVE SHARE WHEN AVAILABLE
    // =====================================

    if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
            files: [qrFile]
        })
    ) {

        await navigator.share({

            title: 'Nexodra Store QR',

            text:
                'Scan this QR code to visit my Nexodra store.',

            files: [qrFile]

        });


        console.log(
            'BRICK STORE QR 4 — QR shared successfully:',
            fileName
        );

        return;

    }


    // =====================================
    // FALLBACK — OPEN IMAGE IN SAME PAGE
    // =====================================

    const qrImage =
        document.createElement('img');

    qrImage.src =
        downloadUrl;

    qrImage.alt =
        'Nexodra Store QR Code';

    qrImage.style.maxWidth =
        '100%';

    qrImage.style.height =
        'auto';


    const qrPreview =
        document.createElement('div');

    qrPreview.style.position =
        'fixed';

    qrPreview.style.inset =
        '0';

    qrPreview.style.zIndex =
        '99999';

    qrPreview.style.background =
        '#ffffff';

    qrPreview.style.display =
        'flex';

    qrPreview.style.flexDirection =
        'column';

    qrPreview.style.alignItems =
        'center';

    qrPreview.style.justifyContent =
        'center';

    qrPreview.style.padding =
        '24px';

    qrPreview.style.boxSizing =
        'border-box';


    const title =
        document.createElement('div');

    title.textContent =
        'Your Store QR';

    title.style.fontSize =
        '22px';

    title.style.fontWeight =
        '700';

    title.style.marginBottom =
        '24px';


    const closeButton =
        document.createElement('button');

    closeButton.textContent =
        'Close';

    closeButton.style.marginTop =
        '24px';

    closeButton.style.padding =
        '12px 24px';

    closeButton.style.border =
        'none';

    closeButton.style.borderRadius =
        '10px';

    closeButton.style.background =
        '#111214';

    closeButton.style.color =
        '#ffffff';

    closeButton.style.fontSize =
        '15px';

    closeButton.style.fontWeight =
        '600';


    closeButton.addEventListener(
        'click',
        () => {

            qrPreview.remove();

        }
    );


    qrPreview.appendChild(
        title
    );

    qrPreview.appendChild(
        qrImage
    );

    qrPreview.appendChild(
        closeButton
    );


    document.body.appendChild(
        qrPreview
    );


    console.log(
        'BRICK STORE QR 4 — QR preview opened:',
        fileName
    );


} catch (error) {

    console.error(
        'BRICK STORE QR 4 — Export failed:',
        error
    );


    alert(
        'Unable to share the QR code on this device.'
    );

}

          
        }
    );

}

if (shareStoreBtn) {

    shareStoreBtn.addEventListener('click', () => {

        if (storeSharePanel) {
            storeSharePanel.style.display = 'block';
        }

        if (publicStoreLink) {

          console.log(
    'BRICK G — Share storeName:',
    storeName
);


console.log(
    'BRICK G — Persistent store slug:',
    storeSlug
);


generatedStoreLink =
    getGeneratedStoreLink();


console.log(
    'BRICK G — Generated public store link:',
    generatedStoreLink
);


publicStoreLink.value =
    generatedStoreLink;
          
        }

    });

}


/*
 * Close share panel.
 */

if (closeSharePanel) {

    closeSharePanel.addEventListener('click', () => {

        if (storeSharePanel) {
            storeSharePanel.style.display = 'none';
        }

    });

}


/*
 * Copy store link.
 */

if (copyStoreLinkBtn) {

    copyStoreLinkBtn.addEventListener('click', async () => {

        try {

            await navigator.clipboard.writeText(
                generatedStoreLink
            );

            copyStoreLinkBtn.textContent =
                'Copied!';

            setTimeout(() => {

                copyStoreLinkBtn.textContent =
                    'Copy';

            }, 1500);

        } catch (error) {

            publicStoreLink.select();

            document.execCommand('copy');

            copyStoreLinkBtn.textContent =
                'Copied!';

            setTimeout(() => {

                copyStoreLinkBtn.textContent =
                    'Copy';

            }, 1500);

        }

    });

}


/*
 * Native phone sharing.
 */

if (nativeShareBtn) {

    nativeShareBtn.addEventListener('click', async () => {

        if (navigator.share) {

            await navigator.share({

                title: storeName,

                text:
                    'Visit my online store: ' +
                    storeName,

                url: generatedStoreLink

            });

        } else {

            alert(
                'Your phone does not support direct sharing. Copy the store link instead.'
            );

        }

    });

}


/*
 * WhatsApp sharing.
 */

if (whatsappShareBtn) {

    whatsappShareBtn.addEventListener('click', () => {

        const message =
            'Visit my online store: ' +
            storeName +
            '\n\n' +
            generatedStoreLink;

        const whatsappUrl =
            'https://wa.me/?text=' +
            encodeURIComponent(message);

        window.open(
            whatsappUrl,
            '_blank'
        );

    });

}

// =========================================
// BRICK PUBLIC STORE 4 — PREVIEW STORE
// =========================================

const previewStoreBtn =
    document.getElementById(
        'previewStoreBtn'
    );

if (previewStoreBtn) {

    previewStoreBtn.addEventListener(
        'click',
        async () => {

            console.log(
                'PUBLIC STORE 4 — Preview Store clicked'
            );

            // Preview belongs to the currently
            // authenticated seller.
            const {
                data: {
                    user
                }
            } =
                await supabaseClient.auth.getUser();

            if (!user) {

                console.error(
                    'PUBLIC STORE 4 — No authenticated user for preview.'
                );

                return;
            }

            console.log(
                'PUBLIC STORE 4 — Preview owner:',
                user.id
            );

            // Preview mode does NOT need a slug.
            currentStoreOwnerId =
                user.id;

            isStorePreviewMode =
                true;

            await showPublicStore();
        }
    );

}


// =========================================
// PUBLIC CUSTOMER STORE - BRICK 2
// =========================================

const publicStore =
    document.getElementById('publicStore');

const sellerDashboard =
    document.querySelector('.app-container');

const publicProductGrid =
    document.getElementById('publicProductGrid');

const publicProductCount =
    document.getElementById('publicProductCount');

const publicProductSearch =
    document.getElementById('publicProductSearch');

const publicCategories =
    document.querySelectorAll('.public-category');

const publicBackBtn =
    document.getElementById('publicBackBtn');

// =========================================
// CUSTOMER BOTTOM NAVIGATION — BRICK 1
// =========================================

const publicBottomButtons =
    document.querySelectorAll(
        '.public-store-bottom .public-bottom-btn'
    );



  // =========================================
// CUSTOMER BOTTOM NAVIGATION — BRICK C1-E
// =========================================

publicBottomButtons.forEach((button, index) => {

    button.addEventListener(
        'click',
        () => {

            /*
             * CUSTOMER STORE
             * Button 0
             */

            if (index === 0) {

              if (publicCustomerMessage) {

    publicCustomerMessage.style.display =
        'none';

}

                const publicCart =
                    document.getElementById(
                        'publicCustomerCart'
                    );

                const publicProductDetail =
                    document.getElementById(
                        'publicProductDetail'
                    );

                const publicHeader =
                    document.querySelector(
                        '.public-store-header'
                    );

                const publicBody =
                    document.querySelector(
                        '.public-store-body'
                    );


                if (publicCart) {

                    publicCart.style.display =
                        'none';

                }

              const checkoutScreen =
    document.getElementById(
        'publicCustomerCheckout'
    );

if (checkoutScreen) {
    checkoutScreen.style.display = 'none';
}


                if (publicProductDetail) {

                    publicProductDetail.style.display =
                        'none';

                }


                if (publicHeader) {

                    publicHeader.style.display =
                        '';

                }


                if (publicBody) {

                    publicBody.style.display =
                        '';

                }


                        /*
 * Restore storefront sections
 */

const storefrontSections = [

    // Restore store banner
    document.querySelector(
        '.public-store-banner-wrapper'
    ),

    // Restore NEW YouTube-style profile
    document.querySelector(
        '.public-store-profile-bar'
    ),

    document.querySelector(
        '.public-section-heading'
    ),

    document.querySelector(
        '.public-categories'
    ),

                    document.querySelector(
                        '.public-product-search'
                    ),

                    document.getElementById(
                        'publicProductGrid'
                    )

                ];


                storefrontSections.forEach(
                    section => {

                        if (section) {

                            section.style.display =
                                '';

                        }

                    }
                );


                console.log(
                    'BRICK CUSTOMER NAV C1-E — Store opened'
                );

            }


            /*
             * CUSTOMER CART
             * Button 1
             */

            if (index === 1) {

              if (publicCustomerMessage) {

    publicCustomerMessage.style.display =
        'none';

}

                const publicCart =
                    document.getElementById(
                        'publicCustomerCart'
                    );

                const publicProductDetail =
                    document.getElementById(
                        'publicProductDetail'
                    );

                const publicHeader =
                    document.querySelector(
                        '.public-store-header'
                    );

                const publicBody =
                    document.querySelector(
                        '.public-store-body'
                    );

              const checkoutScreen =
    document.getElementById(
        'publicCustomerCheckout'
    );

if (checkoutScreen) {

    checkoutScreen.style.display =
        'none';

}


                if (publicProductDetail) {

                    publicProductDetail.style.display =
                        'none';

                }


                if (publicHeader) {

                    publicHeader.style.display =
                        'none';

                }


                /*
                 * IMPORTANT:
                 * The cart is inside .public-store-body,
                 * so the body itself MUST remain visible.
                 */

                if (publicBody) {

                    publicBody.style.display =
                        '';

                }


                /*
                 * Hide normal storefront content
                 */

                const storefrontSections = [

    // Hide store banner
    document.querySelector(
        '.public-store-banner-wrapper'
    ),

    // Hide NEW YouTube-style profile
    document.querySelector(
        '.public-store-profile-bar'
    ),

    // Hide Shop heading
    document.querySelector(
        '.public-section-heading'
    ),

    // Hide categories
    document.querySelector(
        '.public-categories'
    ),

    // Hide product search
    document.querySelector(
        '.public-product-search'
    ),

    // Hide products
    document.getElementById(
        'publicProductGrid'
    )

];


                storefrontSections.forEach(
                    section => {

                        if (section) {

                            section.style.display =
                                'none';

                        }

                    }
                );


                /*
                 * Show customer cart
                 */

                if (publicCart) {

                    publicCart.style.display =
                        'block';

                }


                /*
                 * Render current cart
                 */

                if (
                    typeof renderCustomerCart ===
                    'function'
                ) {

                    renderCustomerCart();

                }


                console.log(
                    'BRICK CUSTOMER NAV C1-E — Cart opened'
                );

            }


         if (index === 2) {

    console.log(
        'BRICK CUSTOMER NAV C1-E — Contact clicked'
    );


    /*
     * Hide normal storefront content
     */

    const publicCart =
        document.getElementById(
            'publicCustomerCart'
        );

    const checkoutScreen =
        document.getElementById(
            'publicCustomerCheckout'
        );

    const publicProductDetail =
        document.getElementById(
            'publicProductDetail'
        );

    const publicHeader =
        document.querySelector(
            '.public-store-header'
        );


    if (publicCart) {

        publicCart.style.display =
            'none';

    }


    if (checkoutScreen) {

        checkoutScreen.style.display =
            'none';

    }


    if (publicProductDetail) {

        publicProductDetail.style.display =
            'none';

    }


    if (publicHeader) {

        publicHeader.style.display =
            'none';

    }


    /*
     * Hide normal storefront sections
     */

    const storefrontSections = [

    // Hide store banner
    document.querySelector(
        '.public-store-banner-wrapper'
    ),

    // Hide NEW YouTube-style profile
    document.querySelector(
        '.public-store-profile-bar'
    ),

    // Hide Shop heading
    document.querySelector(
        '.public-section-heading'
    ),

    // Hide categories
    document.querySelector(
        '.public-categories'
    ),

    // Hide product search
    document.querySelector(
        '.public-product-search'
    ),

    // Hide products
    document.getElementById(
        'publicProductGrid'
    )

];


    storefrontSections.forEach(
        section => {

            if (section) {

                section.style.display =
                    'none';

            }

        }
    );


    /*
     * Show customer message screen
     */

    if (publicCustomerMessage) {

        publicCustomerMessage.style.display =
            'flex';

    }

}

        }
    );

});

// =========================================
// CUSTOMER CHECKOUT — BRICK C2-B
// =========================================

const publicCustomerCheckout =
    document.getElementById(
        'publicCustomerCheckout'
    );

const publicCheckoutBackBtn =
    document.getElementById(
        'publicCheckoutBackBtn'
    );

const publicCheckoutName =
    document.getElementById(
        'publicCheckoutName'
    );

const publicCheckoutPhone =
    document.getElementById(
        'publicCheckoutPhone'
    );

const publicCheckoutAddress =
    document.getElementById(
        'publicCheckoutAddress'
    );

const publicCheckoutCity =
    document.getElementById(
        'publicCheckoutCity'
    );

const publicCheckoutNotes =
    document.getElementById(
        'publicCheckoutNotes'
    );

const publicCheckoutItemCount =
    document.getElementById(
        'publicCheckoutItemCount'
    );

const publicCheckoutTotal =
    document.getElementById(
        'publicCheckoutTotal'
    );

const publicPlaceOrderBtn =
    document.getElementById(
        'publicPlaceOrderBtn'
    );

const publicCartCheckoutBtn =
    document.querySelector(
        '.public-cart-checkout-btn'
    );

// =========================================
// CUSTOMER CHECKOUT — C3-A
// VALIDATION + PAYMENT METHOD
// =========================================

if (publicPlaceOrderBtn) {

    publicPlaceOrderBtn.addEventListener(
        'click',
async () => {

            console.log(
                'BRICK CUSTOMER CHECKOUT C3-A — Place Order clicked'
            );


            // =====================================
            // GET CURRENT CART
            // =====================================

            const cart =
                Array.isArray(window.odropCart)
                    ? window.odropCart
                    : [];


            // =====================================
            // CHECK CART
            // =====================================

            if (cart.length === 0) {

                alert(
                    'Your cart is empty. Please add a product before placing an order.'
                );

                return;

            }


            // =====================================
            // GET CUSTOMER DETAILS
            // =====================================

            const customerName =
                document
                    .getElementById(
                        'checkoutCustomerName'
                    )
                    ?.value
                    .trim() || '';


            const customerPhone =
                document
                    .getElementById(
                        'checkoutCustomerPhone'
                    )
                    ?.value
                    .trim() || '';


            const customerAddress =
                document
                    .getElementById(
                        'checkoutCustomerAddress'
                    )
                    ?.value
                    .trim() || '';


            const customerCity =
                document
                    .getElementById(
                        'checkoutCustomerCity'
                    )
                    ?.value
                    .trim() || '';


            const customerNotes =
                document
                    .getElementById(
                        'checkoutCustomerNotes'
                    )
                    ?.value
                    .trim() || '';


            // =====================================
            // VALIDATE NAME
            // =====================================

            if (!customerName) {

                alert(
                    'Please enter your full name.'
                );

                document
                    .getElementById(
                        'checkoutCustomerName'
                    )
                    ?.focus();

                return;

            }


            // =====================================
            // VALIDATE PHONE
            // =====================================

            if (!customerPhone) {

                alert(
                    'Please enter your phone number.'
                );

                document
                    .getElementById(
                        'checkoutCustomerPhone'
                    )
                    ?.focus();

                return;

            }


            // =====================================
            // VALIDATE ADDRESS
            // =====================================

            if (!customerAddress) {

                alert(
                    'Please enter your delivery address.'
                );

                document
                    .getElementById(
                        'checkoutCustomerAddress'
                    )
                    ?.focus();

                return;

            }


            // =====================================
            // VALIDATE CITY
            // =====================================

            if (!customerCity) {

                alert(
                    'Please enter your city or area.'
                );

                document
                    .getElementById(
                        'checkoutCustomerCity'
                    )
                    ?.focus();

                return;

            }


            // =====================================
            // GET PAYMENT METHOD
            // =====================================

            const selectedPayment =
                document.querySelector(
                    'input[name="checkoutPaymentMethod"]:checked'
                );


            if (!selectedPayment) {

                alert(
                    'Please select a payment method.'
                );

                return;

            }


            const paymentMethod =
                selectedPayment.value;


            // =====================================
            // CURRENT PAYMENT OPTIONS
            // =====================================

            if (
                paymentMethod ===
                'online'
            ) {

                alert(
                    'Online payment is not available yet. Please select Cash on Delivery.'
                );

                return;

            }


            // =====================================
            // COLLECT CHECKOUT DATA
            // =====================================

            const checkoutData = {

                customerName:
                    customerName,

                customerPhone:
                    customerPhone,

                customerAddress:
                    customerAddress,

                customerCity:
                    customerCity,

                customerNotes:
                    customerNotes,

                paymentMethod:
                    paymentMethod,

                cart:
                    cart

            };


            // =====================================
            // TEMPORARY DEBUG LOG
            // =====================================

            console.log(
                'BRICK CUSTOMER CHECKOUT C3-A — Validation successful:',
                checkoutData
            );


            // =====================================
            // PREVENT DOUBLE SUBMISSION
            // =====================================

            publicPlaceOrderBtn.disabled =
                true;


            publicPlaceOrderBtn.dataset.originalText =
                publicPlaceOrderBtn.innerHTML;


            publicPlaceOrderBtn.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Checking Order...
            `;


            // =====================================
// C3-B — CREATE SUPABASE ORDER
// =====================================

try {
    console.log(
        'BRICK CUSTOMER CHECKOUT C3-B — Creating order.'
    );

    if (!currentStoreOwnerId) {
        throw new Error(
            'The store could not be identified.'
        );
    }

    const {
        data: orderStores,
        error: orderStoreError
    } = await supabaseClient
        .from('stores')
        .select('id, owner_id')
        .eq(
            'owner_id',
            currentStoreOwnerId
        )
        .limit(1);

    if (orderStoreError) {
        throw orderStoreError;
    }

    if (
        !orderStores ||
        orderStores.length === 0
    ) {
        throw new Error(
            'The store could not be found.'
        );
    }

    const orderStore =
        orderStores[0];

    const orderTotal =
        cart.reduce(
            (total, item) =>
                total +
                (
                    (Number(item.price) || 0) *
                    (Number(item.quantity) || 1)
                ),
            0
        );

  const orderCustomer =
    await ensureCustomerMessageUser();

if (!orderCustomer) {
    throw new Error(
        'Customer identity could not be created.'
    );
}

console.log(
    'BRICK CUSTOMER CHECKOUT C3-B — Customer identity:',
    orderCustomer.id
);

    const {
        data: createdOrder,
        error: orderInsertError
    } = await supabaseClient
        .from('orders')
        .insert([{
            store_id:
                orderStore.id,

            customer_id:
    orderCustomer.id,

            customer_name:
                customerName,

            customer_phone:
                customerPhone,

            delivery_address:
                customerAddress,

            city:
                customerCity,

            customer_notes:
                customerNotes || null,

            payment_method:
    String(paymentMethod || 'cash_on_delivery')
        .trim()
        .toLowerCase(),

            total_amount:
                orderTotal,

            status:
                'pending'
        }])
        .select()
        .single();

    if (orderInsertError) {
        throw orderInsertError;
    }

    if (!createdOrder) {
        throw new Error(
            'The order was not created.'
        );
    }

    console.log(
        'BRICK CUSTOMER CHECKOUT C3-B — Order created successfully:',
        createdOrder
    );

  // =====================================
// C3-C — CREATE ORDER ITEMS
// =====================================

console.log(
    'BRICK CUSTOMER CHECKOUT C3-C — Creating order items.'
);

console.log(
    'BRICK CUSTOMER CHECKOUT C3-C — CART BEFORE INSERT:',
    cart
);
  
const orderItems = cart.map(item => {
    const itemPrice =
        Number(item.price) || 0;

    const itemQuantity =
        Number(item.quantity) || 1;

    return {
        order_id:
            createdOrder.id,

        product_id:
    item.productId || item.id || null,

        product_name:
            item.title || 'Product',

        price:
            itemPrice,

        quantity:
            itemQuantity,

        subtotal:
            itemPrice * itemQuantity
    };
});

const {
    data: createdOrderItems,
    error: orderItemsInsertError
} = await supabaseClient
    .from('order_items')
    .insert(orderItems)
    .select();

if (orderItemsInsertError) {
    throw orderItemsInsertError;
}

if (
    !createdOrderItems ||
    createdOrderItems.length === 0
) {
    throw new Error(
        'The order was created, but its items could not be created.'
    );
}

console.log(
    'BRICK CUSTOMER CHECKOUT C3-C — Order items created successfully:',
    createdOrderItems
);

  // =====================================
// C3-D — COMPLETE CUSTOMER CHECKOUT
// =====================================

window.odropCart = [];

renderCustomerCart();

console.log(
    'BRICK CUSTOMER CHECKOUT C3-D — Customer cart cleared.'
);

publicPlaceOrderBtn.innerHTML = `
    <i class="fa-solid fa-check"></i>
    Order Created
`;

    publicPlaceOrderBtn.innerHTML = `
        <i class="fa-solid fa-check"></i>
        Order Created
    `;
} catch (error) {
    console.error(
        'BRICK CUSTOMER CHECKOUT C3-B — Order creation failed:',
        error
    );

    alert(
        'Your order could not be submitted.\n\n' +
        (error?.message || error)
    );

    publicPlaceOrderBtn.disabled =
        false;

    publicPlaceOrderBtn.innerHTML =
        publicPlaceOrderBtn.dataset.originalText ||
        `
            <i class="fa-solid fa-check"></i>
            Place Order
        `;
}

        }
    );

}

if (publicCartCheckoutBtn) {

    publicCartCheckoutBtn.addEventListener(
        'click',
        () => {

            const cart =
                Array.isArray(window.odropCart)
                    ? window.odropCart
                    : [];

            if (cart.length === 0) {

                alert('Your cart is empty.');

                return;
            }

            if (publicCustomerCheckout) {

                publicCustomerCheckout.style.display =
                    'block';

            }

            const publicCart =
                document.getElementById(
                    'publicCustomerCart'
                );

            if (publicCart) {

                publicCart.style.display =
                    'none';

            }

            const totalItems =
                cart.reduce(
                    (total, item) =>
                        total +
                        (Number(item.quantity) || 1),
                    0
                );

            const totalPrice =
                cart.reduce(
                    (total, item) =>
                        total +
                        (
                            (Number(item.price) || 0) *
                            (Number(item.quantity) || 1)
                        ),
                    0
                );

            if (publicCheckoutItemCount) {

                publicCheckoutItemCount.textContent =
                    `${totalItems} ${
                        totalItems === 1
                            ? 'item'
                            : 'items'
                    }`;

            }

            if (publicCheckoutTotal) {

                publicCheckoutTotal.textContent =
    formatCurrency(totalPrice);

            }

            console.log(
                'BRICK CUSTOMER CHECKOUT C2-B — Checkout opened:',
                cart
            );

        }
    );

}

// =========================================
// CUSTOMER CART — C2
// QUANTITY + REMOVE CONTROLS
// =========================================

function renderCustomerCart() {

    const publicCartItems =
        document.getElementById(
            'publicCartItems'
        );

    const publicCartTotal =
        document.getElementById(
            'publicCartTotal'
        );


    if (!publicCartItems) {
        console.warn(
            'BRICK CUSTOMER CART C2 — Cart items container not found.'
        );

        return;
    }


    const cart =
        Array.isArray(window.odropCart)
            ? window.odropCart
            : [];


    console.log(
        'BRICK CUSTOMER CART C2 — Rendering:',
        cart
    );


    /*
     * EMPTY CART
     */

    if (cart.length === 0) {

        publicCartItems.innerHTML = `
            <div class="public-cart-empty">

                <i class="fa-solid fa-bag-shopping"></i>

                <strong>Your cart is empty</strong>

                <span>
                    Add products from the store to get started.
                </span>

            </div>
        `;


        if (publicCartTotal) {
    publicCartTotal.textContent =
        formatCurrency(0);
}

        return;
    }


    /*
     * RENDER CART ITEMS
     */

    publicCartItems.innerHTML = '';


    let cartTotal = 0;


    cart.forEach((item, index) => {

        const price =
            Number(item.price) || 0;

        const quantity =
            Math.max(
                1,
                Number(item.quantity) || 1
            );


        /*
         * Keep the stored quantity valid.
         */

        item.quantity = quantity;


        const lineTotal =
            price * quantity;


        cartTotal += lineTotal;


        const cartItem =
            document.createElement('div');

        cartItem.className =
            'public-cart-item';


        cartItem.setAttribute(
            'data-cart-index',
            index
        );


        cartItem.innerHTML = `

            <div class="public-cart-item-image">

                ${
                    item.image
                        ? `
                            <img
                                src="${item.image}"
                                alt="${item.title || 'Product'}"
                                loading="lazy"
                            >
                        `
                        : `
                            <span>
                                📦
                            </span>
                        `
                }

            </div>


            <div class="public-cart-item-info">

                <strong class="public-cart-item-title">
                    ${item.title || 'Untitled Product'}
                </strong>


                <span class="public-cart-item-price">
    ${formatCurrency(price)}
</span>


                <div class="public-cart-item-controls">

                    <button
                        type="button"
                        class="public-cart-qty-btn public-cart-decrease"
                        data-cart-index="${index}"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>


                    <span
                        class="public-cart-quantity"
                    >
                        ${quantity}
                    </span>


                    <button
                        type="button"
                        class="public-cart-qty-btn public-cart-increase"
                        data-cart-index="${index}"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>

                </div>

            </div>


            <div class="public-cart-item-right">

                <strong class="public-cart-line-total">
    ${formatCurrency(lineTotal)}
</strong>


                <button
                    type="button"
                    class="public-cart-remove-btn"
                    data-cart-index="${index}"
                >
                    <i class="fa-solid fa-trash"></i>
                    Remove
                </button>

            </div>

        `;


        publicCartItems.appendChild(
            cartItem
        );

    });


    /*
     * UPDATE CART TOTAL
     */

    if (publicCartTotal) {

        publicCartTotal.textContent =
    formatCurrency(cartTotal);

    }


    console.log(
        'BRICK CUSTOMER CART C2 — Render complete. Total:',
        cartTotal
    );

}

// =========================================
// CUSTOMER CART — C2 ACTIONS
// =========================================

document.addEventListener(
    'click',
    (event) => {

        const decreaseButton =
            event.target.closest(
                '.public-cart-decrease'
            );

        const increaseButton =
            event.target.closest(
                '.public-cart-increase'
            );

        const removeButton =
            event.target.closest(
                '.public-cart-remove-btn'
            );


        /*
         * Nothing related to the customer
         * cart was clicked.
         */

        if (
            !decreaseButton &&
            !increaseButton &&
            !removeButton
        ) {
            return;
        }


        /*
         * Get cart item index.
         */

        const button =
            decreaseButton ||
            increaseButton ||
            removeButton;


        const cartIndex =
            Number(
                button.getAttribute(
                    'data-cart-index'
                )
            );


        if (
            !Number.isInteger(cartIndex) ||
            !Array.isArray(window.odropCart) ||
            !window.odropCart[cartIndex]
        ) {

            console.warn(
                'BRICK CUSTOMER CART C2 — Invalid cart item:',
                cartIndex
            );

            return;
        }


        const cartItem =
            window.odropCart[cartIndex];


        /*
         * DECREASE
         */

        if (decreaseButton) {

            cartItem.quantity =
                Math.max(
                    1,
                    (Number(cartItem.quantity) || 1) - 1
                );


            console.log(
                'BRICK CUSTOMER CART C2 — Quantity decreased:',
                cartItem
            );

        }


        /*
         * INCREASE
         */

        if (increaseButton) {

            cartItem.quantity =
                (Number(cartItem.quantity) || 1) + 1;


            console.log(
                'BRICK CUSTOMER CART C2 — Quantity increased:',
                cartItem
            );

        }


        /*
         * REMOVE
         */

        if (removeButton) {

            console.log(
                'BRICK CUSTOMER CART C2 — Removing:',
                cartItem
            );


            window.odropCart.splice(
                cartIndex,
                1
            );

        }


        /*
         * Re-render immediately.
         */

        renderCustomerCart();

    }
);

// =========================================
// CUSTOMER STORE PROFILE
// APPLY STORE INFORMATION
// =========================================

function applyPublicStoreProfile(
    store
) {

    if (!store) {
        return;
    }


    // =====================================
    // ELEMENTS
    // =====================================

    const logo =
        document.getElementById(
            'publicStoreLogo'
        );


    const name =
        document.getElementById(
            'storeDisplayName'
        );


    const location =
        document.getElementById(
            'publicStoreLocation'
        );


    const phone =
        document.getElementById(
            'publicStorePhone'
        );


    const email =
        document.getElementById(
            'publicStoreEmail'
        );


    const description =
        document.getElementById(
            'publicStoreDescription'
        );


    const contactButton =
        document.getElementById(
            'publicStoreContactBtn'
        );


    // =====================================
    // LOGO
    // =====================================

    if (
        logo &&
        store.profile_image_url
    ) {

        logo.src =
            store.profile_image_url;

    }

  // =====================================
// BRICK F — PUBLIC STORE COVER IMAGE
// =====================================
//
// The seller's cover image is stored in:
//
// store.cover_image_url
//
// The public storefront uses:
//
// #publicStoreBanner
//
// This is separate from
// appearancePreviewCover, which belongs
// to the seller Appearance screen.
// =====================================

const publicStoreBanner =
    document.getElementById(
        'publicStoreBanner'
    );


if (publicStoreBanner) {

    if (
        store.cover_image_url
    ) {

        publicStoreBanner.style.backgroundImage =
            `url("${store.cover_image_url}")`;

        publicStoreBanner.style.backgroundRepeat =
            'no-repeat';

        publicStoreBanner.style.backgroundPosition =
            'center center';

        publicStoreBanner.style.backgroundSize =
            'cover';

        console.log(
            'BRICK F — Public store cover applied:',
            store.cover_image_url
        );

    } else {

        publicStoreBanner.style.backgroundImage =
            '';

        console.warn(
            'BRICK F — Public store has no cover_image_url.'
        );

    }

}

    // =====================================
    // STORE NAME
    // =====================================

    if (name) {

        name.textContent =
            store.name ||
            'My Store';

    }

  // =========================================
// C9-B — CUSTOMER MESSAGING HEADER
// APPLY LIVE STORE STATUS
// =========================================

const publicStoreStatus =
    document.getElementById(
        'publicStoreStatus'
    );

const publicStoreOnlineDot =
    document.getElementById(
        'publicStoreOnlineDot'
    );


// STORE STATUS

if (publicStoreStatus) {

    publicStoreStatus.innerHTML = `
        <span
            class="public-store-status-dot"
        ></span>
        Online
    `;

}


// ONLINE DOT

if (publicStoreOnlineDot) {

    publicStoreOnlineDot.style.display =
        'block';

}


// DEBUG

console.log(
    'BRICK C9-B — Messaging store header applied:',
    {
        storeName:
            store.name || 'My Store',
        logo:
            store.profile_image_url || '',
        status:
            'Online'
    }
);


    // =====================================
    // LOCATION
    // =====================================

    if (location) {

        const locationText =
            location.querySelector(
                'span'
            );


        if (
            store.location &&
            store.location.trim()
        ) {

            if (locationText) {

                locationText.textContent =
                    store.location;

            }

            location.style.display =
                'inline-flex';

        } else {

            location.style.display =
                'none';

        }

    }


    // =====================================
    // PHONE
    // =====================================

    if (phone) {

        const phoneText =
            phone.querySelector(
                'span'
            );


        if (
            store.phone &&
            store.phone.trim()
        ) {

            if (phoneText) {

                phoneText.textContent =
                    store.phone;

            }


            phone.href =
                'tel:' +
                store.phone.replace(
                    /[^\d+]/g,
                    ''
                );


            phone.style.display =
                'inline-flex';

        } else {

            phone.style.display =
                'none';

        }

    }


    // =====================================
    // EMAIL
    // =====================================

    if (email) {

        const emailText =
            email.querySelector(
                'span'
            );


        if (
            store.email &&
            store.email.trim()
        ) {

            if (emailText) {

                emailText.textContent =
                    store.email;

            }


            email.href =
                'mailto:' +
                store.email;


            email.style.display =
                'inline-flex';

        } else {

            email.style.display =
                'none';

        }

    }


    // =====================================
    // DESCRIPTION
    // =====================================

    if (description) {

        if (
            store.description &&
            store.description.trim()
        ) {

            description.textContent =
                store.description;

            description.style.display =
                'block';

        } else {

            description.style.display =
                'none';

        }

    }


    // =====================================
    // CONTACT BUTTON
    // =====================================

    if (contactButton) {

        if (
            store.phone &&
            store.phone.trim()
        ) {

            contactButton.href =
                'tel:' +
                store.phone.replace(
                    /[^\d+]/g,
                    ''
                );


            contactButton.style.display =
                'inline-flex';

        } else if (
            store.email &&
            store.email.trim()
        ) {

            contactButton.href =
                'mailto:' +
                store.email;


            contactButton.style.display =
                'inline-flex';

        } else {

            contactButton.style.display =
                'none';

        }

    }


    console.log(
        'CUSTOMER STORE PROFILE APPLIED:',
        {
            name:
                store.name,

            location:
                store.location,

            phone:
                store.phone,

            email:
                store.email
        }
    );

}

/*
 * Show customer storefront
 * and load the store identified by its slug.
 */

async function showPublicStore() {

    if (!publicStore || !sellerDashboard) {
        return;
    }

    sellerDashboard.style.display = 'none';

    publicStore.style.display = 'block';

      const previewBanner =
        document.getElementById(
            'storePreviewBanner'
        );

    if (previewBanner) {

        previewBanner.style.display =
            isStorePreviewMode
                ? 'flex'
                : 'none';

    }


    let publicStoreData = null;
let publicStoreError = null;


// =========================================
// PREVIEW MODE
// =========================================

if (isStorePreviewMode) {

    console.log(
        'PUBLIC STORE — Loading seller preview by owner ID:',
        currentStoreOwnerId
    );

    const result =
        await supabaseClient
            .from('stores')
            .select('*')
            .eq(
                'owner_id',
                currentStoreOwnerId
            )
            .limit(1);

    publicStoreData =
        result.data;

    publicStoreError =
        result.error;

}


// =========================================
// CUSTOMER / SHARED LINK MODE
// =========================================

else {

    if (!currentPublicStoreSlug) {

        console.error(
            'PUBLIC STORE — No store slug detected.'
        );

        return;
    }

    console.log(
        'PUBLIC STORE — Looking up store by slug:',
        currentPublicStoreSlug
    );

    const result =
        await supabaseClient
            .from('stores')
            .select('*')
            .eq(
                'slug',
                currentPublicStoreSlug
            )
            .limit(1);

    publicStoreData =
        result.data;

    publicStoreError =
        result.error;

}
 
  
// =========================================
// HANDLE RESULT
// =========================================

if (publicStoreError) {

    console.error(
        'PUBLIC STORE — Could not load store:',
        publicStoreError
    );

    return;
}


if (
    !publicStoreData ||
    publicStoreData.length === 0
) {

    console.error(
        'PUBLIC STORE — Store not found.'
    );

    return;
}


const publicStoreRecord =
    publicStoreData[0];

  
    // Remember which seller owns this public store
    currentStoreOwnerId =
        publicStoreRecord.owner_id;


    // Use the actual store name
    storeName =
        publicStoreRecord.name || '';


    console.log(
        'PUBLIC STORE — Store found:',
        publicStoreRecord
    );


    console.log(
    'PUBLIC STORE — Store owner:',
    currentStoreOwnerId
);


// =========================================
// BRICK E — APPLY PUBLIC STORE PROFILE
// =========================================
//
// The store record has now been loaded from
// Supabase. Pass that exact record into the
// public storefront profile renderer.
//
// This populates:
// - Store name
// - Logo
// - Location
// - Phone
// - Email
// - Description
// =========================================

applyPublicStoreProfile(
    publicStoreRecord
);


// Now load this store's published products
await loadPublicProductsFromSupabase();

}


/*
 * =========================================
 * BRICK D — PUBLIC STORE NAVIGATION ISOLATION
 * =========================================
 *
 * Shared customers must NEVER be able to
 * return to the seller dashboard.
 *
 * Seller preview may return to the seller
 * dashboard because preview was opened from
 * the authenticated seller side.
 */

if (publicBackBtn) {

    /*
     * Customer/shared-store mode:
     *
     * Hide the seller-style back button.
     */
    if (!isStorePreviewMode) {

        publicBackBtn.style.display =
            'none';

        console.log(
            'BRICK D — Customer public store: seller back button hidden.'
        );

    } else {

        /*
         * Seller preview mode:
         *
         * Keep the back button available.
         */
        publicBackBtn.style.display =
            'inline-flex';

        publicBackBtn.addEventListener(
            'click',
            () => {

                publicStore.style.display =
                    'none';

                sellerDashboard.style.display =
                    '';

                console.log(
                    'BRICK D — Seller preview exited to dashboard.'
                );

            }
        );

    }

}

// C4-A — BARCODE SCANNER FOUNDATION
// =========================================

let html5QrCodeEngine = null;

let barcodeScannerRunning = false;

let barcodeScannerClosing = false;

let lastLiveSellBarcode = '';
let lastLiveSellScanTime = 0;
let liveSellScanProcessing = false;

// =========================================
// SCANNER ELEMENTS
// =========================================

const scanProductBarcodeBtn =
    document.getElementById(
        'scanProductBarcodeBtn'
    );

const barcodeScannerModal =
    document.getElementById(
        'barcodeScannerModal'
    );

const barcodeScannerReader =
    document.getElementById(
        'barcodeScannerReader'
    );

const closeBarcodeScannerBtn =
    document.getElementById(
        'closeScannerModalBtn'
    );

const productBarcodeInput =
    document.getElementById(
        'productBarcode'
    );


// =========================================
// OPEN SCANNER
// =========================================

async function openBarcodeScanner() {

    console.log(
        'BRICK C4-A — Opening barcode scanner.'
    );


    if (!barcodeScannerModal) {

        console.error(
            'BRICK C4-A — Scanner modal not found.'
        );

        return;
    }


    if (!barcodeScannerReader) {

        console.error(
            'BRICK C4-A — Scanner reader element not found.'
        );

        return;
    }


    if (
        typeof Html5Qrcode ===
        'undefined'
    ) {

        console.error(
            'BRICK C4-A — Html5Qrcode library is not loaded.'
        );

        alert(
            'Barcode scanner could not be loaded. Please refresh the page and try again.'
        );

        return;
    }


    /*
     * Open scanner UI first.
     */

    barcodeScannerModal.style.display =
        'flex';


    /*
     * Prevent duplicate scanner instances.
     */

    if (barcodeScannerRunning) {

        console.log(
            'BRICK C4-A — Scanner is already running.'
        );

        return;
    }


    barcodeScannerClosing =
        false;


    /*
     * Create scanner engine.
     */

    try {

        html5QrCodeEngine =
            new Html5Qrcode(
                'barcodeScannerReader'
            );

    } catch (error) {

        console.error(
            'BRICK C4-A — Could not create scanner:',
            error
        );

        barcodeScannerModal.style.display =
            'none';

        return;
    }


    console.log(
        'BRICK C4-A — Scanner engine created.'
    );


    /*
     * Start camera.
     */

    try {

        await html5QrCodeEngine.start(

            {
                facingMode:
                    'environment'
            },

            {
                fps: 10,

                qrbox: {
                    width: 280,
                    height: 160
                },

                aspectRatio:
                    1.777778
            },

            async (decodedText, decodedResult) => {

    const barcode = String(
        decodedText || ''
    ).trim();

    if (!barcode) {
        return;
    }

    /*
     * Prevent the camera from processing
     * the same barcode repeatedly while it
     * is still in front of the camera.
     */

    const now = Date.now();

    if (
        barcode === lastLiveSellBarcode &&
        now - lastLiveSellScanTime < 1000
    ) {

        return;

    }

    /*
     * Prevent overlapping scan operations.
     */

    if (liveSellScanProcessing) {
        return;
    }

    liveSellScanProcessing = true;

    lastLiveSellBarcode = barcode;
    lastLiveSellScanTime = now;

    try {

        await handleBarcodeScan(
            barcode,
            decodedResult
        );

    } catch (error) {

        console.error(
            'LIVE SELL — Barcode processing failed:',
            error
        );

    } finally {

        liveSellScanProcessing = false;

    }

},

            (scanError) => {

                /*
                 * Normal scanning errors are
                 * ignored because they occur
                 * continuously while searching.
                 */

            }

        );


        barcodeScannerRunning =
            true;


        console.log(
            'BRICK C4-A — Camera scanner started successfully.'
        );


    } catch (error) {

        console.error(
            'BRICK C4-A — Camera failed to start:',
            error
        );


        barcodeScannerRunning =
            false;


        html5QrCodeEngine =
            null;


        barcodeScannerModal.style.display =
            'none';


        alert(
            'Unable to access the camera. Please allow camera permission and try again.'
        );

    }

}


// =========================================
// BARCODE DETECTED
// =========================================

async function handleBarcodeScan(
    decodedText,
    decodedResult
) {

    if (
        !decodedText ||
        barcodeScannerClosing
    ) {

        return;
    }


    barcodeScannerClosing =
        true;


    const barcode =
        String(
            decodedText
        ).trim();


    console.log(
        'BRICK C4-A — Scan successful:',
        barcode
    );


    /*
     * Put the scanned value into
     * the barcode field.
     */

    if (productBarcodeInput) {

        productBarcodeInput.value =
            barcode;

    }


    /*
     * Stop camera before closing UI.
     */

    await closeBarcodeScanner();


    console.log(
        'BRICK C4-A — Barcode returned to product form:',
        barcode
    );

}


// =========================================
// CLOSE SCANNER
// =========================================

async function closeBarcodeScanner() {

    console.log(
        'BRICK C4-A — Closing barcode scanner.'
    );


    barcodeScannerClosing =
        true;


    if (
        html5QrCodeEngine &&
        barcodeScannerRunning
    ) {

        try {

            await html5QrCodeEngine.stop();

            console.log(
                'BRICK C4-A — Camera stopped.'
            );

        } catch (error) {

            console.warn(
                'BRICK C4-A — Camera stop warning:',
                error
            );

        }

    }


    /*
     * Clear scanner engine.
     */

    html5QrCodeEngine =
        null;


    barcodeScannerRunning =
        false;


    /*
     * Clear scanner viewport.
     */

    if (barcodeScannerReader) {

        barcodeScannerReader.innerHTML =
            '';

    }


    /*
     * Hide scanner modal.
     */

    if (barcodeScannerModal) {

        barcodeScannerModal.style.display =
            'none';

    }


    barcodeScannerClosing =
        false;


    console.log(
        'BRICK C4-A — Scanner closed.'
    );

}


// =========================================
// SCAN BUTTON
// =========================================

if (scanProductBarcodeBtn) {

    scanProductBarcodeBtn.addEventListener(
        'click',
        openBarcodeScanner
    );

}


// =========================================
// CLOSE SCANNER BUTTON
// =========================================

const scannerCloseButton =
    document.getElementById(
        'closeScannerModalBtn'
    );

if (scannerCloseButton) {

    scannerCloseButton.onclick = async function (event) {

        event.preventDefault();
        event.stopPropagation();

        console.log(
            'BRICK C4-A — X button clicked.'
        );

        await closeBarcodeScanner();

    };

} else {

    console.error(
        'BRICK C4-A — Close scanner button not found.'
    );

}


// =========================================
// BRICK PUBLIC STORE 4 — EXIT PREVIEW
// =========================================

const exitStorePreviewBtn =
    document.getElementById(
        'exitStorePreviewBtn'
    );

if (exitStorePreviewBtn) {

    exitStorePreviewBtn.addEventListener(
        'click',
        () => {

            console.log(
                'PUBLIC STORE 4 — Exiting preview mode'
            );

            isStorePreviewMode = false;

            publicStore.style.display =
                'none';

            sellerDashboard.style.display =
                '';

        }
    );

}

/*
 * Public store products
 */

let publicStoreCategory = 'All';

// =========================================
// BRICK 3G — LOAD PUBLIC PRODUCTS FROM SUPABASE

async function loadPublicProductsFromSupabase() {

    // Do not query until the public store owner is known.
    if (!currentStoreOwnerId) {

        console.log(
            'BRICK 3G — Waiting for public store owner ID.'
        );

        return;
    }
  
    console.log(
        'BRICK 3G — Loading published products from Supabase...'
    );

      // =========================================
    // C7-A — SHOW PUBLIC PRODUCT LOADING STATE
    // =========================================

    showProductLoadingState(
        publicProductGrid,
        6
    );

    const {
    data: loadedPublicProducts,
    error: publicProductError
} = await supabaseClient
    .from('products')
    .select('*')
    .eq('owner_id', currentStoreOwnerId)
    .eq('published', true)
    .order('title');

    if (publicProductError) {

    console.error(
        'BRICK D — PUBLIC PRODUCT LOAD FAILED:',
        publicProductError
    );

    console.error(
        'BRICK D — Product query details:',
        {
            owner_id:
                currentStoreOwnerId,

            published:
                true,

            error_code:
                publicProductError.code,

            error_message:
                publicProductError.message,

            error_details:
                publicProductError.details,

            error_hint:
                publicProductError.hint
        }
    );

    /*
     * Keep the storefront usable while making
     * the real database problem visible.
     */
    publicProducts = [];

    if (publicProductCount) {

        publicProductCount.textContent =
            '0';

    }

    if (publicProductGrid) {

        publicProductGrid.innerHTML = `
            <div class="public-empty-products">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <strong>
                    Products could not be loaded
                </strong>

                <span>
                    Please try again shortly.
                </span>

            </div>
        `;

    }

    return;
}


    console.log(
        'BRICK 3G — Published products loaded:',
        loadedPublicProducts
    );


    // Store public products separately
    // from the logged-in seller's products.
    publicProducts =
        loadedPublicProducts || [];


    renderPublicProducts();

}


function renderPublicProducts() {

    if (!publicProductGrid) {
        return;
    }

    const searchTerm =
        publicProductSearch
        ? publicProductSearch.value
            .toLowerCase()
            .trim()
        : '';


    const visibleProducts =
        publicProducts.filter(product => {

            const published =
                product.published !== false;

            const matchesCategory =
                publicStoreCategory === 'All' ||
                product.category === publicStoreCategory;

            const matchesSearch =
    String(
        product.title || ''
    )
        .toLowerCase()
        .includes(searchTerm);

            return (
                published &&
                matchesCategory &&
                matchesSearch
            );

        });


    if (publicProductCount) {

        publicProductCount.textContent =
            visibleProducts.length;

    }


    if (visibleProducts.length === 0) {

        publicProductGrid.innerHTML = `
            <div class="public-empty-products">

                <i class="fa-solid fa-box-open"></i>

                <strong>No products found</strong>

                <span>
                    Try another category or search term.
                </span>

            </div>
        `;

        return;
    }


    publicProductGrid.innerHTML = '';


    visibleProducts.forEach(product => {

        const card =
            document.createElement('div');

        card.className =
    'public-product-card product-card-enter';

card.setAttribute(
    'data-product-id',
    product.id
);
      
        card.innerHTML = `
    <div class="public-product-image">

        ${
            product.image
                ? `
                    <img
                        src="${product.image}"
                        alt="${product.title || 'Product image'}"
                        loading="lazy"
                    >
                `
                : `
                    <span>
                        ${product.emoji || '📦'}
                    </span>
                `
        }

    </div>

    <h3>
        ${product.title || 'Untitled Product'}
    </h3>

    <span class="public-product-category">
        ${product.category || 'Product'}
    </span>

    <div class="public-product-bottom">

        <span class="public-product-price">
    ${formatCurrency(Number(product.price || 0))}
</span>

        <button
            type="button"
            class="public-buy-btn"
        >
            View
        </button>

    </div>
`;
      
                publicProductGrid.appendChild(card);
    });

    attachPublicProductEvents();

}


// =========================================
// PRODUCT DELETE BUTTON
// =========================================

if (productGrid) {

    productGrid.addEventListener(
        'click',
        async (event) => {

            const deleteButton =
                event.target.closest(
                    '.product-delete-btn'
                );

            if (!deleteButton) {
                return;
            }


            const productId =
    deleteButton.getAttribute(
        'data-product-id'
    );

console.log(
    'PRODUCT DELETE — Button clicked. Product ID:',
    productId
);


            const productIndex =
    products.findIndex(
        product =>
            String(product.id) ===
            String(productId)
    );


            if (productIndex === -1) {
                return;
            }


            const product =
                products[productIndex];


            const confirmed =
                confirm(
                    `Delete "${product.title}"?`
                );


            if (!confirmed) {
                return;
            }


            // =========================================
            // GET AUTHENTICATED USER
            // =========================================

            const {
                data: {
                    user
                },
                error: userError
            } = await supabaseClient.auth.getUser();


            if (userError) {

                console.error(
                    'PRODUCT DELETE — Could not get authenticated user:',
                    userError
                );

                return;
            }


            if (!user) {

                console.error(
                    'PRODUCT DELETE — No authenticated user.'
                );

                return;
            }


            console.log(
                'PRODUCT DELETE — Deleting product from Supabase:',
                productId
            );


            // =========================================
            // DELETE FROM SUPABASE
            // =========================================

            const {
                error: deleteError
            } = await supabaseClient
                .from('products')
                .delete()
                .eq(
                    'id',
                    productId
                )
                .eq(
                    'owner_id',
                    user.id
                );


            if (deleteError) {

                console.error(
                    'PRODUCT DELETE — Supabase delete failed:',
                    deleteError
                );

                alert(
                    'Could not delete product.\n\n' +
                    deleteError.message
                );

                return;
            }


            console.log(
                'PRODUCT DELETE — Product deleted from Supabase successfully.'
            );


            // =========================================
            // REMOVE FROM LOCAL PRODUCT LIST
            // =========================================

            products.splice(
                productIndex,
                1
            );


            // =========================================
            // SAVE UPDATED LOCAL COPY
            // =========================================

            localStorage.setItem(
                'odropProducts',
                JSON.stringify(products)
            );


            // =========================================
            // REFRESH SELLER PRODUCTS
            // =========================================

            renderProducts();


            // =========================================
            // REFRESH PUBLIC STORE
            // =========================================

            if (
                typeof renderPublicProducts ===
                'function'
            ) {

                renderPublicProducts();

            }

        }
    );

}


/*
 * Public category filters
 */

publicCategories.forEach(categoryButton => {

    categoryButton.addEventListener('click', () => {

        publicCategories.forEach(button => {

            button.classList.remove('active');

        });

        categoryButton.classList.add('active');

        publicStoreCategory =
            categoryButton.getAttribute(
                'data-category'
            );

        renderPublicProducts();

    });

});


/*
 * Public product search
 */

if (publicProductSearch) {

    publicProductSearch.addEventListener(
        'input',
        renderPublicProducts
    );

}


/*
 * Detect public-store mode.
 */

/* =========================================
   NEXODRA — GITHUB PAGES ROUTE RESTORE
   BRICK B
========================================= */

const pendingRoute =
    sessionStorage.getItem(
        'nexodraPendingRoute'
    );

if (pendingRoute) {

    sessionStorage.removeItem(
        'nexodraPendingRoute'
    );

    try {

        const restoredUrl =
            new URL(
                pendingRoute,
                window.location.origin
            );

        window.history.replaceState(
            null,
            '',
            restoredUrl.pathname +
            restoredUrl.search +
            restoredUrl.hash
        );

        console.log(
            'PUBLIC STORE — Restored pending route:',
            restoredUrl.pathname
        );

    } catch (error) {

        console.error(
            'PUBLIC STORE — Failed to restore route:',
            error
        );

    }
}


/*
 * GitHub Pages Project Pages uses:
 *
 * /nexodra-seller-app/
 *
 * Internally the Nexodra router works with:
 *
 * /
 * /store/odro
 *
 * Therefore remove the project prefix before
 * the existing route detection runs.
 */

const APP_BASE_PATH =
    '/nexodra-seller-app';

const browserPath =
    window.location.pathname;

const currentPath =
    browserPath === APP_BASE_PATH
        ? '/'
        : browserPath.startsWith(
            APP_BASE_PATH + '/'
        )
            ? browserPath.slice(
                APP_BASE_PATH.length
            )
            : browserPath;

console.log(
    'ROUTING TEST — browser pathname:',
    browserPath
);

console.log(
    'ROUTING TEST — normalized pathname:',
    currentPath
);

console.log(
    'ROUTING TEST — href:',
    window.location.href
);


if (
    currentPath.startsWith('/store/')
) {

    currentPublicStoreSlug =
        currentPath
            .replace('/store/', '')
            .split('/')[0];

  isStorePreviewMode = false;

    console.log(
        'PUBLIC STORE — Slug detected:',
        currentPublicStoreSlug
    );

    showPublicStore();

}

// =========================================
// BRICK 3D — LOAD PRODUCTS FROM SUPABASE
// =========================================

async function loadProductsFromSupabase() {

    console.log(
        'BRICK 3D — Loading products from Supabase...'
    );

    // =========================================
    // C7-A — SHOW PRODUCT LOADING STATE
    // =========================================

    showProductLoadingState(
        productGrid,
        6
    );
  
    // Get the currently authenticated user
    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError) {

        console.error(
            'BRICK 3D — Could not get authenticated user:',
            userError
        );

        return;
    }


    if (!user) {

        console.log(
            'BRICK 3D — No authenticated user.'
        );

        return;
    }


    console.log(
        'BRICK 3D — Logged-in user ID:',
        user.id
    );


    // Load only this user's products
    const {
        data: supabaseProducts,
        error: productError
    } = await supabaseClient
        .from('products')
        .select('*')
        .eq('owner_id', user.id)
        .order('title');


    if (productError) {

        console.error(
            'BRICK 3D — Could not load products:',
            productError
        );

        return;
    }


    console.log(
        'BRICK 3D — Products loaded from Supabase:',
        supabaseProducts
    );


    // Replace the local product list with
// the authenticated user's Supabase products.
products = supabaseProducts || [];


// =========================================
// BRICK S2-A — SYNC BARCODE CACHE
// =========================================

syncOdropBarcodeCache(
    products,
    user.id
);


// Keep the existing product interface working.
renderProducts();


// Sync the same products to the Sell page.
syncSellProducts();

}


// Run Brick 3D
loadProductsFromSupabase();

// =========================================
// BRICK 3 - PERSISTENT PUBLIC STORE
// =========================================

function saveProducts() {

    localStorage.setItem(
        'odropProducts',
        JSON.stringify(products)
    );

}



// =========================================
// CUSTOMER PRODUCT DETAILS - BRICK 4
// =========================================

const publicProductDetail =
    document.getElementById(
        'publicProductDetail'
    );

const closeProductDetail =
    document.getElementById(
        'closeProductDetail'
    );

const detailProductImage =
    document.getElementById(
        'detailProductImage'
    );

const detailProductName =
    document.getElementById(
        'detailProductName'
    );

const detailProductCategory =
    document.getElementById(
        'detailProductCategory'
    );

const detailProductStock =
    document.getElementById(
        'detailProductStock'
    );

const detailProductDescription =
    document.getElementById(
        'detailProductDescription'
    );

const detailProductBarcode =
    document.getElementById(
        'detailProductBarcode'
    );

const detailAddToCart =
    document.getElementById(
        'detailAddToCart'
    );

const variantsBox =
    document.getElementById(
        'productDetailsVariants'
    );

const variantOptionsBox =
    document.getElementById(
        'productDetailsVariantOptions'
    );


/*
 * Open product details.
 */

function openProductDetails(product) {

    if (!publicProductDetail) {
        return;
    }

    /*
     * Hide the storefront product list.
     */

    const publicHeader =
        document.querySelector(
            '.public-store-header'
        );

    const publicBody =
        document.querySelector(
            '.public-store-body'
        );

    if (publicHeader) {
    publicHeader.style.display = 'none';
}

const storefrontSections = [
    document.querySelector(
        '.public-store-banner-wrapper'
    ),
    document.querySelector('.public-store-profile-bar'),
    document.querySelector('.public-section-heading'),
    document.querySelector('.public-categories'),
    document.querySelector('.public-product-search'),
    publicProductGrid
];

storefrontSections.forEach(section => {

    if (section) {
        section.style.display = 'none';
    }

});


    /*
     * Fill product information.
     */

    if (detailProductImage) {

    if (product.image) {

        detailProductImage.innerHTML = `
            <img
                src="${product.image}"
                alt="${product.title || 'Product image'}"
            >
        `;

    } else {

        detailProductImage.textContent =
            product.emoji || '📦';

    }

}

    if (detailProductName) {
        detailProductName.textContent =
            product.title;
    }

    if (detailProductCategory) {
        detailProductCategory.textContent =
            product.category;
    }

    const priceElement =
        document.querySelector(
            '.public-detail-price'
        );

    if (priceElement) {

        priceElement.textContent =
    formatCurrency(
        Number(product.price)
    );

    }


    if (detailProductStock) {

        const stock =
            Number(product.stock);

        if (stock <= 0) {

            detailProductStock.textContent =
                'Out of Stock';

        } else if (stock <= 5) {

            detailProductStock.textContent =
                stock + ' left in stock';

        } else {

            detailProductStock.textContent =
                'In Stock';

        }

    }


    if (detailProductDescription) {

        detailProductDescription.textContent =
            product.description ||
            'No description provided for this product.';

    }
// Product variants
if (
    variantsBox &&
    variantOptionsBox &&
    product.variants
) {

    let variantsHTML = '';


    if (
        product.variants.size &&
        product.variants.size.length
    ) {

        variantsHTML += `
            <div class="product-variant-group">

                <strong>Size</strong>

                <div class="product-variant-options">

                    ${
                        product.variants.size
                            .map(size => `
                                <span class="product-variant-option">
                                    ${size}
                                </span>
                            `)
                            .join('')
                    }

                </div>

            </div>
        `;

    }


    if (
        product.variants.color &&
        product.variants.color.length
    ) {

        variantsHTML += `
            <div class="product-variant-group">

                <strong>Color</strong>

                <div class="product-variant-options">

                    ${
                        product.variants.color
                            .map(color => `
                                <span class="product-variant-option">
                                    ${color}
                                </span>
                            `)
                            .join('')
                    }

                </div>

            </div>
        `;

    }


    if (variantsHTML) {

        variantOptionsBox.innerHTML =
            variantsHTML;

        variantsBox.style.display =
            'block';

    } else {

        variantsBox.style.display =
            'none';

    }

} else if (variantsBox) {

    variantsBox.style.display =
        'none';

}

    if (detailProductBarcode) {

        detailProductBarcode.textContent =
            product.barcode
                ? 'BARCODE: ' + product.barcode
                : '';

    }


    /*
     * Disable cart button when out of stock.
     */

    if (detailAddToCart) {

        const stock =
            Number(product.stock);

        detailAddToCart.disabled =
            stock <= 0;

        detailAddToCart.style.opacity =
            stock <= 0 ? '0.5' : '1';

    }


    /*
     * Show details.
     */

    publicProductDetail.style.display =
        'block';


    /*
     * Remember selected product.
     */

    window.currentPublicProduct =
        product;

}


/*
 * Make public product cards clickable.
 */

function attachPublicProductEvents() {

    if (!publicProductGrid) {
        return;
    }

    publicProductGrid
        .querySelectorAll('.public-product-card')
        .forEach(card => {

            const productId =
                card.getAttribute(
                    'data-product-id'
                );

            const product =
                publicProducts.find(
                    item =>
                        String(item.id) ===
                        String(productId)
                );

            if (!product) {
                return;
            }


            /*
             * Product card → Product Details.
             */

            card.addEventListener(
                'click',
                () => {

                    console.log(
                        'BRICK PUBLIC PRODUCT DETAILS — Opening:',
                        product
                    );

                    openProductDetails(product);

                }
            );


            /*
             * Add to Cart shortcut.
             */

            const buyButton =
                card.querySelector(
                    '.public-buy-btn'
                );

            if (buyButton) {

                buyButton.textContent =
                    'Add to Cart';

                buyButton.addEventListener(
                    'click',
                    event => {

                        event.stopPropagation();

                        if (!window.odropCart) {
                            window.odropCart = [];
                        }

                        const existingItem =
                            window.odropCart.find(
                                item =>
                                    String(item.productId) ===
                                    String(product.id)
                            );

                        if (existingItem) {

                            existingItem.quantity =
                                (existingItem.quantity || 1) + 1;

                        } else {

                            window.odropCart.push({

                                productId:
                                    product.id,

                                title:
                                    product.title,

                                price:
                                    Number(product.price || 0),

                                image:
                                    product.image || '',

                                quantity:
                                    1

                            });

                        }

                        console.log(
                            'BRICK CUSTOMER CART B3 — Added:',
                            product.title
                        );

                        console.log(
                            'BRICK CUSTOMER CART B3 — Cart:',
                            window.odropCart
                        );

                        alert(
                            `${product.title} added to cart 🛒`
                        );

                    }
                );

            }

        });

}



attachPublicProductEvents();

/*
 * Close product details.
 */

if (closeProductDetail) {

    closeProductDetail.addEventListener(
        'click',
        () => {

            if (publicProductDetail) {
                publicProductDetail.style.display =
                    'none';
            }

            const publicHeader =
                document.querySelector(
                    '.public-store-header'
                );

            if (publicHeader) {
                publicHeader.style.display = '';
            }

            const storefrontSections = [
    document.querySelector(
        '.public-store-banner-wrapper'
    ),
    document.querySelector(
        '.public-store-profile-bar'
    ),
    document.querySelector(
        '.public-section-heading'
    ),
    document.querySelector(
        '.public-categories'
    ),
    document.querySelector(
        '.public-product-search'
    ),
    publicProductGrid
];

            storefrontSections.forEach(
                section => {

                    if (section) {
                        section.style.display = '';
                    }

                }
            );

        }
    );

}



/*
 * Add to cart.
 */

if (detailAddToCart) {

    detailAddToCart.addEventListener(
        'click',
        () => {

            const product =
                window.currentPublicProduct;

            if (!product) {
                return;
            }

            if (Number(product.stock) <= 0) {

                alert(
                    'This product is currently out of stock.'
                );

                return;

            }

           const existingCartItem =
    window.odropCart.find(
        item =>
            item.productId === product.id
    );

if (existingCartItem) {

    existingCartItem.quantity += 1;

} else {

    window.odropCart.push({
        productId: product.id,
        title: product.title,
        price: Number(product.price) || 0,
        image: product.image || '',
        quantity: 1
    });

}

console.log(
    'BRICK CUSTOMER CART B2 — Added:',
    product.title,
    window.odropCart
);

alert(
    product.title +
    ' has been added to your cart.'
); 

        }
    );

}

// =========================================
// BRICK 1 - STORE APPEARANCE
// SUPABASE PROFILE + COVER IMAGES
// =========================================

const openAppearanceBtn =
    document.getElementById(
        'openAppearanceBtn'
    );

const closeAppearanceBtn =
    document.getElementById(
        'closeAppearanceBtn'
    );

const appearanceScreen =
    document.getElementById(
        'appearanceScreen'
    );


// =========================================
// AVATAR ELEMENTS
// =========================================

const appearanceAvatarPreview =
    document.getElementById(
        'appearanceAvatarPreview'
    );

const appearancePreviewAvatar =
    document.getElementById(
        'appearancePreviewAvatar'
    );

const appearanceUploadAvatarBtn =
    document.getElementById(
        'appearanceUploadAvatarBtn'
    );

const appearanceRemoveAvatarBtn =
    document.getElementById(
        'appearanceRemoveAvatarBtn'
    );

const appearanceAvatarInput =
    document.getElementById(
        'appearanceAvatarInput'
    );


// =========================================
// COVER ELEMENTS
// =========================================

const appearancePreviewCover =
    document.getElementById(
        'appearancePreviewCover'
    );

const appearanceUploadCoverBtn =
    document.getElementById(
        'appearanceUploadCoverBtn'
    );

const appearanceCoverInput =
    document.getElementById(
        'appearanceCoverInput'
    );

// =========================================
// C5-C — VIDEO COVER INPUT
// =========================================

const appearanceUploadVideoCoverBtn =
    document.getElementById(
        'appearanceUploadVideoCoverBtn'
    );

const appearanceVideoCoverInput =
    document.getElementById(
        'appearanceVideoCoverInput'
    );

// =========================================
// C5-F — APPLY SAVED VIDEO COVER
// =========================================

function applyStoreVideoCoverUrl(
    url
) {

    if (!appearancePreviewCover) {
        console.warn(
            'BRICK C5-F — Cover preview container not found.'
        );
        return;
    }

    const existingVideo =
        appearancePreviewCover.querySelector(
            '.store-video-cover-preview'
        );

    if (existingVideo) {
        existingVideo.pause();
        existingVideo.remove();
    }

    if (!url) {
        return;
    }

    const video =
        document.createElement('video');

    video.className =
        'store-video-cover-preview';

    video.src = url;

    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.preload = 'metadata';

    // Preserve the existing cover frame.
    // Do not alter its dimensions.
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.display = 'block';
    video.style.borderRadius = 'inherit';

    appearancePreviewCover
        .style
        .backgroundImage = '';

    appearancePreviewCover
        .classList
        .add('has-image');

    const placeholder =
        appearancePreviewCover.querySelector(
            'span'
        );

    if (placeholder) {
        placeholder.style.display =
            'none';
    }

    appearancePreviewCover.appendChild(
        video
    );

    console.log(
        'BRICK C5-F — Saved video cover applied:',
        url
    );

    video.play().catch(
        error => {

            console.warn(
                'BRICK C5-F — Saved video autoplay did not start:',
                error
            );

        }
    );
}

// =========================================
// STORE THEME ELEMENTS
// =========================================

const appearanceThemeOptions =
    document.querySelectorAll(
        '.appearance-theme-option'
    );


let selectedStoreTheme =
    localStorage.getItem(
        'odropStoreTheme'
    ) || 'default';

// =========================================
// APPLY STORE THEME
// =========================================

function applyStoreTheme(
    theme
) {

    // Remove previous theme classes

    document.body.classList.remove(
        'store-theme-default',
        'store-theme-dark'
    );


    // Apply selected theme

    if (
        theme === 'dark'
    ) {

        document.body.classList.add(
            'store-theme-dark'
        );

    } else {

        document.body.classList.add(
            'store-theme-default'
        );

    }


    // Update selected button

    appearanceThemeOptions.forEach(
        option => {

            option.classList.remove(
                'active'
            );


            if (
                option.dataset.theme ===
                theme
            ) {

                option.classList.add(
                    'active'
                );

            }

        }
    );


    // Save selection

    selectedStoreTheme =
        theme;


    localStorage.setItem(
        'odropStoreTheme',
        theme
    );


    console.log(
        'Store theme applied:',
        theme
    );

}

// =========================================
// STORE THEME BUTTON EVENTS
// =========================================

appearanceThemeOptions.forEach(
    option => {

        option.addEventListener(
            'click',
            () => {

                const theme =
                    option.dataset.theme;


                // For now, only Light
                // and Dark are active

                if (
                    theme !== 'default' &&
                    theme !== 'dark'
                ) {

                    return;

                }


                applyStoreTheme(
                    theme
                );

            }
        );

    }
);

// =========================================
// RESTORE SAVED THEME
// =========================================

applyStoreTheme(
    selectedStoreTheme
);

// =========================================================
// C11 — CUSTOMER STORE THEME TOGGLE
// =========================================================

const customerThemeToggleBtn =
    document.getElementById(
        'customerThemeToggleBtn'
    );

const customerThemeToggleIcon =
    document.getElementById(
        'customerThemeToggleIcon'
    );


// =========================================================
// UPDATE CUSTOMER THEME ICON
// =========================================================

function updateCustomerThemeToggleIcon() {

    if (
        !customerThemeToggleIcon
    ) {

        return;

    }


    const isDark =
        document.body.classList.contains(
            'store-theme-dark'
        );


    /*
       Light mode:
       show MOON because tapping it
       will switch to dark mode.
    */

    if (!isDark) {

        customerThemeToggleIcon.className =
            'fa-solid fa-moon';

        customerThemeToggleBtn?.setAttribute(
            'aria-label',
            'Switch to dark mode'
        );

        customerThemeToggleBtn?.setAttribute(
            'title',
            'Switch to dark mode'
        );

    }


    /*
       Dark mode:
       show SUN because tapping it
       will switch back to light mode.
    */

    else {

        customerThemeToggleIcon.className =
            'fa-solid fa-sun';

        customerThemeToggleBtn?.setAttribute(
            'aria-label',
            'Switch to light mode'
        );

        customerThemeToggleBtn?.setAttribute(
            'title',
            'Switch to light mode'
        );

    }

}


// =========================================================
// TOGGLE CUSTOMER THEME
// =========================================================

if (
    customerThemeToggleBtn
) {

    customerThemeToggleBtn.addEventListener(
        'click',
        () => {

            const isDark =
                document.body.classList.contains(
                    'store-theme-dark'
                );


            if (isDark) {

                applyStoreTheme(
                    'default'
                );

            } else {

                applyStoreTheme(
                    'dark'
                );

            }


            updateCustomerThemeToggleIcon();

        }
    );

}


// =========================================================
// INITIAL ICON
// =========================================================

updateCustomerThemeToggleIcon();

// =========================================
// SAVE
// =========================================

const saveAppearanceBtn =
    document.getElementById(
        'saveAppearanceBtn'
    );


// =========================================
// TEMPORARY IMAGE STATE
// =========================================

let selectedStoreProfileImage = null;

let selectedStoreCoverImage = null;

// =========================================
// C5-D — TEMPORARY VIDEO COVER STATE
// =========================================

let selectedStoreVideoCover = null;

let selectedStoreVideoCoverPreviewUrl = '';

let currentStoreProfileImageUrl = '';

let currentStoreCoverImageUrl = '';

let currentStoreVideoCoverUrl = '';


// =========================================
// SUPABASE STORAGE BUCKET
// =========================================
//
// IMPORTANT:
// Create this bucket in Supabase Storage:
// store-images
//
// If you already created the bucket with another
// name, change ONLY this value.
//

const STORE_IMAGE_BUCKET =
    'store-images';


// =========================================
// OPEN APPEARANCE
// =========================================

if (openAppearanceBtn) {

    openAppearanceBtn.addEventListener(
        'click',
        async () => {

            document
                .querySelectorAll('.screen')
                .forEach(screen => {

                    screen.classList.remove(
                        'active'
                    );

                });


            if (appearanceScreen) {

                appearanceScreen.classList.add(
                    'active'
                );

            }


            await loadStoreAppearance();

        }
    );

}


// =========================================
// LOAD STORE APPEARANCE
// =========================================

async function loadStoreAppearance() {

    console.log(
        'BRICK C5-A — Loading store appearance.'
    );


    try {

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabaseClient
                .auth
                .getUser();


        if (userError) {

            console.error(
                'BRICK C5-A — Could not get authenticated user:',
                userError
            );

            return;

        }


        if (!user) {

            console.warn(
                'BRICK C5-A — No authenticated user.'
            );

            return;

        }


        const {
            data: store,
            error: storeError
        } =
            await supabaseClient
                .from('stores')
                .select(
                    'id, owner_id, name, description, profile_image_url, cover_image_url, cover_video_url'
                )
                .eq(
                    'owner_id',
                    user.id
                )
                .maybeSingle();


        if (storeError) {

            console.error(
                'BRICK C5-A — Store appearance load failed:',
                storeError
            );

            return;

        }


        if (!store) {

            console.warn(
                'BRICK C5-A — No Supabase store found for user:',
                user.id
            );

            return;

        }


        console.log(
            'BRICK C5-A — Supabase store appearance loaded:',
            store
        );


        currentStoreProfileImageUrl =
            store.profile_image_url || '';


        currentStoreCoverImageUrl =
            store.cover_image_url || '';

         // =========================================
// C5-F — RESTORE SAVED VIDEO COVER
// =========================================

currentStoreVideoCoverUrl =
    store.cover_video_url || '';

console.log(
    'BRICK C5-F — Saved video cover URL:',
    currentStoreVideoCoverUrl
);

        // =====================================
        // APPLY PROFILE IMAGE
        // =====================================

        applyStoreProfileImage(
            currentStoreProfileImageUrl
        );


        // =====================================
        // APPLY COVER IMAGE
        // =====================================

        applyStoreCoverImage(
            currentStoreCoverImageUrl
        );

      if (
    currentStoreVideoCoverUrl
) {

    applyStoreVideoCoverUrl(
        currentStoreVideoCoverUrl
    );

}


        console.log(
            'BRICK C5-A — Store appearance applied.'
        );

    } catch (error) {

        console.error(
            'BRICK C5-A — Appearance load exception:',
            error
        );

    }

}


// =========================================
// APPLY PROFILE IMAGE
// =========================================

function applyStoreProfileImage(url) {

    const targets = [

        appearanceAvatarPreview,

        appearancePreviewAvatar

    ];


    targets.forEach(
        target => {

            if (!target) {
                return;
            }


            if (url) {

                target.innerHTML =
                    '';

                const img =
                    document.createElement(
                        'img'
                    );

                img.src =
                    url;

                img.alt =
                    'Store profile image';

                img.loading =
                    'lazy';

                target.appendChild(
                    img
                );

            } else {

                target.innerHTML =
                    '<i class="fa-solid fa-store"></i>';

            }

        }
    );

}


// =========================================
// APPLY COVER IMAGE
// =========================================

function applyStoreCoverImage(
    url
) {

    if (!appearancePreviewCover) {
        return;
    }


    if (url) {

        /*
         * The image reaching this function
         * has already been cropped to 16:9.
         *
         * Display it directly inside the
         * 16:9 preview container.
         */

        appearancePreviewCover.style.backgroundImage =
            `url("${url}")`;


        appearancePreviewCover.style.backgroundRepeat =
            'no-repeat';


        appearancePreviewCover.style.backgroundPosition =
            'center center';


        appearancePreviewCover.style.backgroundSize =
            '100% 100%';


        appearancePreviewCover.classList.add(
            'has-image'
        );


        const placeholder =
            appearancePreviewCover.querySelector(
                'span'
            );


        if (placeholder) {

            placeholder.style.display =
                'none';

        }


        console.log(
            '16:9 cropped cover applied:',
            url
        );

    } else {

        appearancePreviewCover.style.backgroundImage =
            '';


        appearancePreviewCover.style.backgroundRepeat =
            '';


        appearancePreviewCover.style.backgroundPosition =
            '';


        appearancePreviewCover.style.backgroundSize =
            '';


        appearancePreviewCover.classList.remove(
            'has-image'
        );


        const placeholder =
            appearancePreviewCover.querySelector(
                'span'
            );


        if (placeholder) {

            placeholder.style.display =
                '';

        }

    }

}


// =========================================
// CHOOSE PROFILE IMAGE
// =========================================

if (appearanceUploadAvatarBtn) {

    appearanceUploadAvatarBtn.addEventListener(
        'click',
        () => {

            if (appearanceAvatarInput) {

                appearanceAvatarInput.click();

            }

        }
    );

}


// =========================================
// PROFILE IMAGE SELECTED
// =========================================

if (appearanceAvatarInput) {

    appearanceAvatarInput.addEventListener(
        'change',
        event => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    'image/'
                )
            ) {

                alert(
                    'Please select an image.'
                );

                return;

            }


            selectedStoreProfileImage =
                file;


            // Instant preview
            const previewUrl =
                URL.createObjectURL(
                    file
                );


            applyStoreProfileImage(
                previewUrl
            );


            console.log(
                'BRICK C5-A — Profile image selected:',
                file.name
            );

        }
    );

}


// =========================================
// REMOVE PROFILE IMAGE
// =========================================

if (appearanceRemoveAvatarBtn) {

    appearanceRemoveAvatarBtn.addEventListener(
        'click',
        () => {

            selectedStoreProfileImage =
                null;

            currentStoreProfileImageUrl =
                '';


            applyStoreProfileImage(
                ''
            );


            if (appearanceAvatarInput) {

                appearanceAvatarInput.value =
                    '';

            }


            console.log(
                'BRICK C5-A — Profile image marked for removal.'
            );

        }
    );

}


// =========================================
// CHOOSE COVER IMAGE
// =========================================

if (appearanceUploadCoverBtn) {

    appearanceUploadCoverBtn.addEventListener(
        'click',
        () => {

            if (appearanceCoverInput) {

                appearanceCoverInput.click();

            }

        }
    );

}

// =========================================
// C5-C — CHOOSE VIDEO COVER
// =========================================

if (appearanceUploadVideoCoverBtn) {

    appearanceUploadVideoCoverBtn.addEventListener(
        'click',
        () => {

            if (appearanceVideoCoverInput) {

                appearanceVideoCoverInput.click();

            }

        }
    );

}

// =========================================
// HANDLE CROPPED STORE COVER
// =========================================

function handleStoreCoverImage(
    file
) {

    if (!file) {
        return;
    }


    if (
        !file.type.startsWith(
            'image/'
        )
    ) {

        alert(
            'Please select an image.'
        );

        return;

    }


    selectedStoreCoverImage =
        file;


    const previewUrl =
        URL.createObjectURL(
            file
        );


    applyStoreCoverImage(
        previewUrl
    );


    console.log(
        'Store cover cropped and ready:',
        file.name
    );

}

// =========================================
// COVER IMAGE SELECTED
// =========================================

if (appearanceCoverInput) {

    appearanceCoverInput.addEventListener(
        'change',
        event => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            openImageCropper(
                file,
                'cover'
            );


            // Allow re-selecting
            // the same image

            appearanceCoverInput.value =
                '';

        }
    );

}

// =========================================
// C5-C — VIDEO COVER SELECTED
// =========================================

if (appearanceVideoCoverInput) {

    appearanceVideoCoverInput.addEventListener(
        'change',
        event => {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            console.log(
                'BRICK C5-C — Video cover selected:',
                {
                    name: file.name,
                    type: file.type,
                    size: file.size
                }
            );

          applyStoreVideoCoverPreview(
    file
);

            // Allow selecting the same video again.
            appearanceVideoCoverInput.value =
                '';

        }
    );

}

// =========================================
// C5-D — VIDEO COVER PREVIEW
// =========================================

function applyStoreVideoCoverPreview(
    file
) {

    if (!file) {
        return;
    }

    if (
        !file.type.startsWith(
            'video/'
        )
    ) {

        alert(
            'Please select a video file.'
        );

        return;
    }

    if (!appearancePreviewCover) {
        console.error(
            'BRICK C5-D — Cover preview container not found.'
        );

        return;
    }

    // Remove previous video preview
    const existingVideo =
        appearancePreviewCover.querySelector(
            '.store-video-cover-preview'
        );

    if (existingVideo) {

        existingVideo.pause();

        existingVideo.remove();

    }

    // Revoke previous temporary URL
    if (
        selectedStoreVideoCoverPreviewUrl
    ) {

        URL.revokeObjectURL(
            selectedStoreVideoCoverPreviewUrl
        );

    }

    selectedStoreVideoCover =
        file;

    selectedStoreVideoCoverPreviewUrl =
        URL.createObjectURL(
            file
        );

    const video =
        document.createElement(
            'video'
        );

    video.className =
        'store-video-cover-preview';

    video.src =
        selectedStoreVideoCoverPreviewUrl;

    video.autoplay =
        true;

    video.muted =
        true;

    video.loop =
        true;

    video.playsInline =
        true;

    video.controls =
        false;

    video.preload =
        'metadata';

    video.style.width =
        '100%';

    video.style.height =
        '100%';

    video.style.objectFit =
        'cover';

    video.style.display =
        'block';

    video.style.borderRadius =
        'inherit';

    appearancePreviewCover
        .style.backgroundImage =
        '';

    appearancePreviewCover
        .classList.add(
            'has-image'
        );

    const placeholder =
        appearancePreviewCover.querySelector(
            'span'
        );

    if (placeholder) {

        placeholder.style.display =
            'none';

    }

    appearancePreviewCover.appendChild(
        video
    );

    console.log(
        'BRICK C5-D — Video cover preview applied:',
        {
            name: file.name,
            type: file.type,
            size: file.size,
            previewUrl:
                selectedStoreVideoCoverPreviewUrl
        }
    );

    video.play().catch(
        error => {

            console.warn(
                'BRICK C5-D — Video autoplay did not start:',
                error
            );

        }
    );
}

// =========================================
// UPLOAD IMAGE TO SUPABASE STORAGE
// =========================================

async function uploadStoreImage(
    file,
    folder
) {

    if (!file) {
        return null;
    }


    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();


    if (userError) {
        throw userError;
    }


    if (!user) {

        throw new Error(
            'No authenticated user.'
        );

    }


    const extension =
        file.name
            .split('.')
            .pop()
            .toLowerCase();


    const filePath =
        `${user.id}/${folder}-${Date.now()}.${extension}`;


    console.log(
        'BRICK C5-A — Uploading store image:',
        filePath
    );


    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from(
                STORE_IMAGE_BUCKET
            )
            .upload(
                filePath,
                file,
                {
                    cacheControl:
                        '3600',

                    upsert:
                        false,

                    contentType:
                        file.type
                }
            );


    if (uploadError) {

        throw uploadError;

    }


    const {
        data
    } =
        supabaseClient
            .storage
            .from(
                STORE_IMAGE_BUCKET
            )
            .getPublicUrl(
                filePath
            );


    if (!data?.publicUrl) {

        throw new Error(
            'Could not create public image URL.'
        );

    }


    return data.publicUrl;

}

// =========================================
// C5-E — UPLOAD VIDEO COVER
// =========================================

async function uploadStoreVideoCover(
    file
) {

    if (!file) {
        return null;
    }

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();

    if (userError) {
        throw userError;
    }

    if (!user) {
        throw new Error(
            'No authenticated user.'
        );
    }

    if (
        !file.type.startsWith(
            'video/'
        )
    ) {
        throw new Error(
            'Selected file is not a video.'
        );
    }

    const extension =
        file.name
            .split('.')
            .pop()
            .toLowerCase();

    const filePath =
        `${user.id}/video-cover-${Date.now()}.${extension}`;

    console.log(
        'BRICK C5-E — Uploading video cover:',
        {
            filePath,
            name: file.name,
            type: file.type,
            size: file.size
        }
    );

    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from(
                STORE_IMAGE_BUCKET
            )
            .upload(
                filePath,
                file,
                {
                    cacheControl:
                        '3600',

                    upsert:
                        false,

                    contentType:
                        file.type
                }
            );

    if (uploadError) {
        throw uploadError;
    }

    const {
        data
    } =
        supabaseClient
            .storage
            .from(
                STORE_IMAGE_BUCKET
            )
            .getPublicUrl(
                filePath
            );

    if (!data?.publicUrl) {
        throw new Error(
            'Could not create public video URL.'
        );
    }

    console.log(
        'BRICK C5-E — Video cover uploaded:',
        data.publicUrl
    );

    return data.publicUrl;
}

// =========================================
// SAVE APPEARANCE
// =========================================

if (saveAppearanceBtn) {

    saveAppearanceBtn.addEventListener(
        'click',
        async () => {

            console.log(
                'BRICK C5-A — Saving store appearance.'
            );


            saveAppearanceBtn.disabled =
                true;


            const originalText =
                saveAppearanceBtn.innerHTML;


            saveAppearanceBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';


            try {

                const {
                    data: {
                        user
                    },
                    error: userError
                } =
                    await supabaseClient
                        .auth
                        .getUser();


                if (userError) {
                    throw userError;
                }


                if (!user) {

                    throw new Error(
                        'No authenticated user.'
                    );

                }


                // =================================
                // UPLOAD PROFILE IMAGE
                // =================================

                if (
                    selectedStoreProfileImage
                ) {

                    currentStoreProfileImageUrl =
                        await uploadStoreImage(
                            selectedStoreProfileImage,
                            'profile'
                        );

                }


                // =================================
                // UPLOAD COVER IMAGE
                // =================================

                if (
                    selectedStoreCoverImage
                ) {

                    currentStoreCoverImageUrl =
                        await uploadStoreImage(
                            selectedStoreCoverImage,
                            'cover'
                        );

                }

              // =====================================
             // C5-E — UPLOAD VIDEO COVER
            // =====================================

                if (
                    selectedStoreVideoCover
              ) {

                  currentStoreVideoCoverUrl =
                  await uploadStoreVideoCover(
                       selectedStoreVideoCover
                 );

              }


                // =================================
                // UPDATE SUPABASE STORE
                // =================================

                const {
                    data: updatedStore,
                    error: updateError
                } =
                    await supabaseClient
                        .from('stores')
                        .update({
                          
                         profile_image_url:
                         currentStoreProfileImageUrl ||
                         null,

                         cover_image_url:
                           currentStoreCoverImageUrl ||
                         null,

                         cover_video_url:
                           currentStoreVideoCoverUrl ||
                        null
                     })
                        .eq(
                            'owner_id',
                            user.id
                        )
                        .select(
                              'id, owner_id, profile_image_url, cover_image_url, cover_video_url'
                        )
                        .maybeSingle();


                if (updateError) {

                    throw updateError;

                }


                if (!updatedStore) {

                    throw new Error(
                        'No store row was updated. Please make sure this seller has a stores row.'
                    );

                }


                console.log(
                    'BRICK C5-A — Supabase store appearance updated:',
                    updatedStore
                );


                // =================================
                // UPDATE CURRENT PREVIEW
                // =================================

                applyStoreProfileImage(
                    currentStoreProfileImageUrl
                );

                applyMainStoreProfileImage(
    currentStoreProfileImageUrl
);


                applyStoreCoverImage(
                    currentStoreCoverImageUrl
                );


                // =================================
                // RESET TEMPORARY STATE
                // =================================

                selectedStoreProfileImage =
                    null;

                selectedStoreCoverImage =
                    null;


                if (appearanceAvatarInput) {

                    appearanceAvatarInput.value =
                        '';

                }


                if (appearanceCoverInput) {

                    appearanceCoverInput.value =
                        '';

                }


                console.log(
                    'BRICK C5-A — Store appearance saved successfully.'
                );


                alert(
                    'Store appearance saved successfully.'
                );


            } catch (error) {

                console.error(
                    'BRICK C5-A — Store appearance save failed:',
                    error
                );


                alert(
                    'Could not save store appearance. ' +
                    (
                        error?.message ||
                        'Please try again.'
                    )
                );

            } finally {

                saveAppearanceBtn.disabled =
                    false;

                saveAppearanceBtn.innerHTML =
                    originalText;

            }

        }
    );

}


// =========================================
// BACK TO PROFILE
// =========================================

if (closeAppearanceBtn) {

    closeAppearanceBtn.addEventListener(
        'click',
        () => {

            if (appearanceScreen) {

                appearanceScreen.classList.remove(
                    'active'
                );

            }


            const profileScreen =
                document.getElementById(
                    'profileScreen'
                );


            if (profileScreen) {

                profileScreen.classList.add(
                    'active'
                );

            }


            if (screenTitle) {

                screenTitle.textContent =
                    'Profile';

            }

        }
    );

}


// =========================================
// INITIAL LOAD
// =========================================

loadStoreAppearance();

// =========================================
// BRICK C5-B
// APPLY STORE PROFILE IMAGE
// TO MAIN APP AVATARS
// =========================================

function applyMainStoreProfileImage(url) {

    const targets = [

        document.querySelector(
            '.store-avatar'
        ),

        document.querySelector(
            '.profile-avatar'
        )

    ];


    targets.forEach(
        target => {

            if (!target) {
                return;
            }


            if (url) {

                target.innerHTML = '';


                const img =
                    document.createElement(
                        'img'
                    );


                img.src = url;

                img.alt =
                    'Store logo';

                img.loading =
                    'lazy';


                target.appendChild(
                    img
                );

            } else {

                target.innerHTML =
                    '<i class="fa-solid fa-store"></i>';

            }

        }
    );

}

// =========================================
// IMAGE CROPPER — SHARED CONTROLLER
// =========================================

const imageCropModal =
    document.getElementById(
        'imageCropModal'
    );


const imageCropTarget =
    document.getElementById(
        'imageCropTarget'
    );


const cancelImageCropBtn =
    document.getElementById(
        'cancelImageCropBtn'
    );


const confirmImageCropBtn =
    document.getElementById(
        'confirmImageCropBtn'
    );


let activeCropper = null;

let activeCropType = null;

let activeOriginalFile = null;

let activeObjectUrl = null;


// =========================================
// OPEN IMAGE CROPPER
// =========================================

function openImageCropper(
    file,
    type
) {

    if (!file) {
        return;
    }


    if (
        !file.type.startsWith(
            'image/'
        )
    ) {

        alert(
            'Please select an image.'
        );

        return;
    }


    // Clean up old cropper

    destroyImageCropper();


    activeOriginalFile =
        file;


    activeCropType =
        type;


    // Create temporary preview URL

    activeObjectUrl =
        URL.createObjectURL(
            file
        );


    imageCropTarget.src =
        activeObjectUrl;


    imageCropModal.classList.add(
        'active'
    );


    imageCropModal.setAttribute(
        'aria-hidden',
        'false'
    );


    // Wait until image loads

    imageCropTarget.onload =
        () => {

            let aspectRatio =
                NaN;


            // Product = square

            if (
                type === 'product'
            ) {

                aspectRatio =
                    1 / 1;

            }


            // Store cover = 16:9

            if (
                type === 'cover'
            ) {

                aspectRatio =
                    16 / 9;

            }


            activeCropper =
    new Cropper(
        imageCropTarget,
        {

            // Product = 1:1
            // Cover = 16:9
            aspectRatio:
                aspectRatio,


            // Keep the crop box inside
            // the image area
            viewMode:
                1,


            // User moves the image
            dragMode:
                'move',


            // Start with a clearly visible
            // crop rectangle
            autoCropArea:
                0.75,


            // Crop box can be moved
            cropBoxMovable:
                true,


            // Crop box can be resized
            cropBoxResizable:
                true,


            // Image can be moved
            movable:
                true,


            // Image can be zoomed
            zoomable:
                true,


            zoomOnWheel:
                true,


            responsive:
                true,


            restore:
                false,


            // Show the crop guides
            guides:
                true,


            center:
                true,


            highlight:
                true,


            toggleDragModeOnDblclick:
                false

        }
    );

        };


    console.log(
        'Image cropper opened:',
        type,
        file.name
    );

}


// =========================================
// DESTROY CROPPER
// =========================================

function destroyImageCropper() {

    if (activeCropper) {

        activeCropper.destroy();

        activeCropper =
            null;

    }


    if (activeObjectUrl) {

        URL.revokeObjectURL(
            activeObjectUrl
        );

        activeObjectUrl =
            null;

    }


    if (imageCropTarget) {

        imageCropTarget.onload =
            null;

        imageCropTarget.src =
            '';

    }

}


// =========================================
// CLOSE CROPPER
// =========================================

function closeImageCropper() {

    destroyImageCropper();


    if (imageCropModal) {

        imageCropModal.classList.remove(
            'active'
        );


        imageCropModal.setAttribute(
            'aria-hidden',
            'true'
        );

    }


    activeCropType =
        null;

    activeOriginalFile =
        null;

}


// =========================================
// CANCEL CROP
// =========================================

if (cancelImageCropBtn) {

    cancelImageCropBtn.addEventListener(
        'click',
        () => {

            closeImageCropper();

        }
    );

}


// =========================================
// CONFIRM CROP
// =========================================

if (confirmImageCropBtn) {

    confirmImageCropBtn.addEventListener(
        'click',
        () => {

            if (!activeCropper) {

                return;

            }


            let outputWidth =
                1000;

            let outputHeight =
                1000;


            // Product output

            if (
                activeCropType ===
                'product'
            ) {

                outputWidth =
                    1000;

                outputHeight =
                    1000;

            }


            // Cover output

            if (
                activeCropType ===
                'cover'
            ) {

                outputWidth =
                    1600;

                outputHeight =
                    900;

            }


            const croppedCanvas =
                activeCropper.getCroppedCanvas(
                    {

                        width:
                            outputWidth,

                        height:
                            outputHeight,

                        imageSmoothingEnabled:
                            true,

                        imageSmoothingQuality:
                            'high'

                    }
                );


            if (!croppedCanvas) {

                alert(
                    'Could not crop this image.'
                );

                return;

            }


            croppedCanvas.toBlob(
                blob => {

                    if (!blob) {

                        alert(
                            'Could not create cropped image.'
                        );

                        return;

                    }


                    const baseName =
                        activeOriginalFile?.name
                            ?.replace(
                                /\.[^/.]+$/,
                                ''
                            )
                        || 'image';


                    const croppedFile =
                        new File(
                            [

                                blob

                            ],
                            `${baseName}-cropped.jpg`,
                            {

                                type:
                                    'image/jpeg',

                                lastModified:
                                    Date.now()

                            }
                        );


                    const cropType =
                        activeCropType;


                    // Close before forwarding

                    closeImageCropper();


                    // =================================
                    // SEND CROPPED FILE TO EXISTING FLOW
                    // =================================

                    if (
                        cropType ===
                        'product'
                    ) {

                        handleProductImage(
                            croppedFile
                        );

                    }


                    if (
                        cropType ===
                        'cover'
                    ) {

                        handleStoreCoverImage(
                            croppedFile
                        );

                    }


                    console.log(
                        'Cropped image created:',
                        croppedFile
                    );

                },
                'image/jpeg',
                0.9
            );

        }
    );

}

// =========================================
// BRICK 2 - PRODUCT IMAGE IMPORT + CAMERA
// =========================================

const importProductImageBtn =
    document.getElementById('importProductImageBtn');

const takeProductPhotoBtn =
    document.getElementById('takeProductPhotoBtn');

const productImageInput =
    document.getElementById('productImageInput');

const productCameraInput =
    document.getElementById('productCameraInput');

const productUploadPreview =
    document.getElementById('productUploadPreview');

let selectedProductImage = '';


// Open phone gallery

if (importProductImageBtn) {

    importProductImageBtn.addEventListener('click', () => {

        productImageInput.click();

    });

}


// Open phone camera

if (takeProductPhotoBtn) {

    takeProductPhotoBtn.addEventListener('click', () => {

        productCameraInput.click();

    });

}


// Process and compress selected product image

function handleProductImage(file) {

    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {

        alert('Please select an image.');

        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {

        const img = new Image();

        img.onload = function() {

            // Maximum image size
            const maxWidth = 800;
            const maxHeight = 800;

            let width = img.width;
            let height = img.height;

            // Resize large images
            if (width > maxWidth || height > maxHeight) {

                const ratio = Math.min(
                    maxWidth / width,
                    maxHeight / height
                );

                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            // Create canvas
            const canvas =
                document.createElement('canvas');

            canvas.width = width;
            canvas.height = height;

            const ctx =
                canvas.getContext('2d');

            ctx.drawImage(
                img,
                0,
                0,
                width,
                height
            );

            // Compress image
            selectedProductImage =
                canvas.toDataURL(
                    'image/jpeg',
                    0.7
                );

            console.log(
                'Compressed product image:',
                selectedProductImage.length,
                'characters'
            );

            // Show preview
            if (productUploadPreview) {

                productUploadPreview.innerHTML = `
                    <img
                        src="${selectedProductImage}"
                        alt="Product image preview"
                    >
                `;

            }

        };

        img.onerror = function() {

            alert(
                'Could not process this image. Please try another image.'
            );

        };

        img.src = event.target.result;
    };

    reader.onerror = function() {

        alert(
            'Could not read the image. Please try again.'
        );

    };

    reader.readAsDataURL(file);
}


// Gallery image selected

if (productImageInput) {

    productImageInput.addEventListener(
        'change',
        () => {

            const file =
                productImageInput.files?.[0];

            if (!file) {
                return;
            }

            openImageCropper(
                file,
                'product'
            );

            // Allow selecting the same image again
            productImageInput.value =
                '';

        }
    );

}

// Camera image taken

if (productCameraInput) {

    productCameraInput.addEventListener(
        'change',
        () => {

            const file =
                productCameraInput.files?.[0];

            if (!file) {
                return;
            }

            openImageCropper(
                file,
                'product'
            );

            // Allow selecting the same image again
            productCameraInput.value =
                '';

        }
    );

}

/* =========================================
   ODROP AUTH R1 — REMEMBER LOGIN
========================================= */

const ODROP_REMEMBER_KEY =
    'odropRememberLogin';

const ODROP_REMEMBER_EMAIL_KEY =
    'odropRememberEmail';


 // =========================================
 // BRICK 1H — REGISTER NEXODRA SERVICE WORKER
 // WITH VISIBLE REGISTRATION DIAGNOSTICS
 // =========================================

(function () {

    'use strict';

    function nexodraShowServiceWorkerStatus(message) {

        const output = document.getElementById(
            'nexodra-real-notification-result'
        );

        if (output) {
            output.textContent = message;
        }

        console.log(
            'BRICK 1H — ' + message
        );
    }

    if (!('serviceWorker' in navigator)) {

        nexodraShowServiceWorkerStatus(
            'SERVICE WORKER UNSUPPORTED\n' +
            'This browser does not support service workers.'
        );

        return;
    }

    function nexodraRegisterServiceWorker() {

        nexodraShowServiceWorkerStatus(
            'REGISTERING SERVICE WORKER...\n' +
            'File: ./service-worker.js'
        );

        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function (registration) {

                window.nexodraServiceWorkerRegistration =
                    registration;

                console.log(
                    'BRICK 1H — Service worker registered successfully:',
                    registration.scope
                );

                nexodraShowServiceWorkerStatus(
                    'SERVICE WORKER REGISTRATION SUCCEEDED\n' +
                    'Scope: ' + registration.scope + '\n' +
                    'Installing: ' +
                    (registration.installing?.state || 'None') + '\n' +
                    'Waiting: ' +
                    (registration.waiting?.state || 'None') + '\n' +
                    'Active: ' +
                    (registration.active?.state || 'Not active yet')
                );

                function nexodraTrackWorker(worker) {

                    if (!worker) return;

                    worker.addEventListener(
                        'statechange',
                        function () {

                            nexodraShowServiceWorkerStatus(
                                'SERVICE WORKER STATE CHANGED\n' +
                                'State: ' + worker.state + '\n' +
                                'Scope: ' + registration.scope
                            );

                        }
                    );
                }

                nexodraTrackWorker(
                    registration.installing
                );

                nexodraTrackWorker(
                    registration.waiting
                );

                nexodraTrackWorker(
                    registration.active
                );

                navigator.serviceWorker.ready
                    .then(function (readyRegistration) {

                        window.nexodraServiceWorkerRegistration =
                            readyRegistration;

                        const activeWorker =
                            readyRegistration.active;

                        nexodraShowServiceWorkerStatus(
                            'SERVICE WORKER READY\n' +
                            'Scope: ' + readyRegistration.scope + '\n' +
                            'Active worker: ' +
                            (activeWorker
                                ? activeWorker.state
                                : 'Not available') + '\n' +
                            'Notification API: ' +
                            (('Notification' in window)
                                ? 'Available'
                                : 'Unavailable') + '\n' +
                            'Permission: ' +
                            (('Notification' in window)
                                ? Notification.permission
                                : 'Unsupported') + '\n' +
                            'showNotification: ' +
                            (activeWorker &&
                             readyRegistration.showNotification
                                ? 'Available'
                                : 'Not available')
                        );

                    })
                    .catch(function (error) {

                        nexodraShowServiceWorkerStatus(
                            'SERVICE WORKER READY CHECK FAILED\n' +
                            error.name + ': ' + error.message
                        );

                    });

                registration.addEventListener(
                    'updatefound',
                    function () {

                        const newWorker =
                            registration.installing;

                        if (newWorker) {
                            nexodraTrackWorker(newWorker);

                            nexodraShowServiceWorkerStatus(
                                'SERVICE WORKER UPDATE FOUND\n' +
                                'State: ' + newWorker.state
                            );
                        }

                    }
                );

            })
            .catch(function (error) {

                console.error(
                    'BRICK 1H — Service worker registration failed:',
                    error
                );

                nexodraShowServiceWorkerStatus(
                    'SERVICE WORKER REGISTRATION FAILED\n' +
                    'Error: ' + error.name + '\n' +
                    'Message: ' + error.message + '\n' +
                    'Check that ./service-worker.js is accessible ' +
                    'and that its installation succeeds.'
                );

            });

    }

    if (document.readyState === 'complete') {

        nexodraRegisterServiceWorker();

    } else {

        window.addEventListener(
            'load',
            nexodraRegisterServiceWorker,
            { once: true }
        );

    }

})();


 // =========================================
 // BRICK 1I — NEXODRA SERVICE WORKER STATUS
 // =========================================

window.nexodraCheckServiceWorker = async function () {

    const output = document.getElementById(
        'nexodra-real-notification-result'
    );

    function report(message) {

        if (output) {
            output.textContent = message;
        }

        console.log(
            'BRICK 1I — ' + message
        );
    }

    if (!('serviceWorker' in navigator)) {

        report(
            'SERVICE WORKERS NOT SUPPORTED'
        );

        return;
    }

    try {

        const registrations =
            await navigator.serviceWorker.getRegistrations();

        if (registrations.length === 0) {

            report(
                'NO SERVICE WORKER REGISTRATION FOUND\n' +
                'Current URL: ' + location.href + '\n' +
                'Secure context: ' + isSecureContext + '\n' +
                'Expected file: ' +
                new URL('./service-worker.js', location.href).href
            );

            return;
        }

        const details = registrations.map(
            function (registration, index) {

                return (
                    'Registration ' + (index + 1) + '\n' +
                    'Scope: ' + registration.scope + '\n' +
                    'Installing: ' +
                    (registration.installing?.state || 'None') + '\n' +
                    'Waiting: ' +
                    (registration.waiting?.state || 'None') + '\n' +
                    'Active: ' +
                    (registration.active?.state || 'None')
                );

            }
        ).join('\n\n');

        report(
            'SERVICE WORKER REGISTRATIONS FOUND\n' +
            details
        );

    } catch (error) {

        report(
            'SERVICE WORKER CHECK FAILED\n' +
            error.name + ': ' + error.message
        );

    }

};


 // =========================================
 // BRICK 1J — SERVICE WORKER FAILURE DIAGNOSTICS
 // =========================================

window.nexodraDiagnoseServiceWorker = async function () {

    const output = document.getElementById(
        'nexodra-real-notification-result'
    );

    function report(message) {

        if (output) {
            output.textContent = message;
        }

        console.log(
            'BRICK 1J — ' + message
        );

    }

    try {

        if (!('serviceWorker' in navigator)) {

            report('FAILED: Service workers are unsupported.');
            return;

        }

        const registrations =
            await navigator.serviceWorker.getRegistrations();

        if (!registrations.length) {

            report(
                'NO REGISTRATION FOUND\n' +
                'Page: ' + location.href + '\n' +
                'Expected script: ' +
                new URL('./service-worker.js', location.href).href
            );

            return;

        }

        const results = [];

        for (const registration of registrations) {

            results.push(
                'Scope: ' + registration.scope,
                'Installing: ' +
                    (registration.installing?.state || 'None'),
                'Waiting: ' +
                    (registration.waiting?.state || 'None'),
                'Active: ' +
                    (registration.active?.state || 'None'),
                'Script URL: ' +
                    (
                        registration.active ||
                        registration.installing ||
                        registration.waiting
                    )?.scriptURL || 'Unavailable'
            );

        }

        report(
            'SERVICE WORKER DIAGNOSTICS\n' +
            'Secure context: ' + isSecureContext + '\n' +
            'Page: ' + location.href + '\n\n' +
            results.join('\n')
        );

    } catch (error) {

        report(
            'DIAGNOSTIC ERROR\n' +
            error.name + ': ' + error.message
        );

    }

};


// =========================================
// BRICK 2A — CHECK EXISTING PUSH SUBSCRIPTION
// =========================================

async function checkNexodraPushSubscription() {

    const registration =
        window.nexodraServiceWorkerRegistration;

    if (!registration) {

        console.warn(
            'BRICK 2A — Service worker registration is not ready.'
        );

        return null;
    }

    if (!registration.pushManager) {

        console.warn(
            'BRICK 2A — Push notifications are not supported.'
        );

        return null;
    }

    try {

        const subscription =
            await registration.pushManager.getSubscription();

        if (subscription) {

            console.log(
                'BRICK 2A — Existing push subscription found.'
            );

            return subscription;
        }

        console.log(
            'BRICK 2A — No push subscription exists yet.'
        );

        return null;

    } catch (error) {

        console.error(
            'BRICK 2A — Could not check push subscription:',
            error
        );

        return null;
    }
}


/* =========================================
   BRICK 2D — CHECK NOTIFICATION PERMISSION
========================================= */

function checkNexodraNotificationPermission() {
    // Check whether the Notifications API is supported
    if (
        typeof window === 'undefined' ||
        !('Notification' in window)
    ) {
        console.warn(
            'BRICK 2D — Notifications are not supported in this environment.'
        );

        return {
            supported: false,
            permission: 'unsupported',
            canNotify: false
        };
    }

    // Read the browser's current notification permission
    const permission = Notification.permission;

    const result = {
        supported: true,
        permission,
        canNotify: permission === 'granted'
    };

    console.log(
        'BRICK 2D — Notification permission status:',
        result
    );

    return result;
}

/* =========================================
   BRICK 2E — REQUEST NOTIFICATION PERMISSION
========================================= */

async function requestNexodraNotificationPermission() {
    // Check whether notifications are supported
    const status = checkNexodraNotificationPermission();

    if (!status.supported) {
        return status;
    }

    // Permission is already granted
    if (status.permission === 'granted') {
        return status;
    }

    // Permission has already been denied
    if (status.permission === 'denied') {
        console.warn(
            'BRICK 2E — Notification permission has been denied.'
        );

        return status;
    }

    // Request permission only when the status is default
    try {
        const permission = await Notification.requestPermission();

        const result = {
            supported: true,
            permission,
            canNotify: permission === 'granted'
        };

        console.log(
            'BRICK 2E — Notification permission result:',
            result
        );

        return result;
    } catch (error) {
        console.error(
            'BRICK 2E — Failed to request notification permission:',
            error
        );

        return {
            supported: true,
            permission: 'error',
            canNotify: false,
            error: error.message
        };
    }
}


/* =========================================
   BRICK 2F — DISPLAY NOTIFICATION
   DESKTOP + SERVICE WORKER SUPPORT
========================================= */

async function displayNexodraNotification(title, options = {}) {
    try {
        if (
            typeof window === 'undefined' ||
            !('Notification' in window)
        ) {
            throw new Error(
                'Notifications are not supported in this browser.'
            );
        }

        if (Notification.permission !== 'granted') {
            throw new Error(
                `Notification permission is ${Notification.permission}.`
            );
        }

        if (typeof title !== 'string' || !title.trim()) {
            throw new Error('A valid notification title is required.');
        }

        const notificationOptions = {
            body: options.body || '',
            ...options
        };

        // Preferred path for mobile browsers.
        if ('serviceWorker' in navigator) {
            const registration =
                window.nexodraServiceWorkerRegistration ||
                await navigator.serviceWorker.ready;

            if (
                registration &&
                typeof registration.showNotification === 'function'
            ) {
                await registration.showNotification(
                    title,
                    notificationOptions
                );

                console.info(
                    'BRICK 2F — Service worker notification displayed.'
                );

                return true;
            }
        }

        // Fallback for browsers supporting the Notification constructor.
        const notification = new Notification(
            title,
            notificationOptions
        );

        notification.onshow = () => {
            console.info('BRICK 2F — Notification show event received.');
        };

        notification.onerror = (event) => {
            console.error('BRICK 2F — Notification error:', event);
        };

        console.info('BRICK 2F — Notification created successfully.');

        return notification;

    } catch (error) {
        console.error(
            'BRICK 2F — Notification creation failed:',
            error.name,
            error.message,
            error
        );

        return null;
    }
}


/* =========================================
   BRICK 2G — NOTIFICATION ERROR HANDLING
========================================= */

function handleNexodraNotificationError(error, context = '') {
    const errorDetails = {
        brick: 'BRICK 2G',
        context,
        message:
            error instanceof Error
                ? error.message
                : String(error || 'Unknown notification error'),
        timestamp: new Date().toISOString()
    };

    console.error(
        'BRICK 2G — Notification error:',
        errorDetails
    );

    return {
        success: false,
        error: errorDetails.message,
        context: errorDetails.context,
        timestamp: errorDetails.timestamp
    };
}

/* =========================================
   BRICK 2G — NOTIFICATION DIAGNOSTICS
========================================= */

function getNexodraNotificationDiagnostics() {
    const status = checkNexodraNotificationPermission();

    const diagnostics = {
        supported: status.supported,
        permission: status.permission,
        canNotify: status.canNotify,
        secureContext:
            typeof window !== 'undefined'
                ? window.isSecureContext
                : false,
        timestamp: new Date().toISOString()
    };

    console.log(
        'BRICK 2G — Notification diagnostics:',
        diagnostics
    );

    return diagnostics;
}


/* =========================================
   BRICK 2H — NEXODRA NOTIFICATION SELF-TEST
========================================= */

async function runNexodraNotificationSelfTest() {

console.log(
    'BRICK 2H — Self-test function started.'
);
  
    const results = [];

    function record(name, passed, details) {
        const result = {
            test: name,
            status: passed ? 'PASS' : 'FAIL',
            details
        };

        results.push(result);

        const log = passed ? console.info : console.error;
        log(`[BRICK 2H] ${result.status}: ${name}`, details);
    }

    // Test 1: Required functions exist
    const functionsAvailable =
        typeof checkNexodraNotificationPermission === 'function' &&
        typeof requestNexodraNotificationPermission === 'function' &&
        typeof displayNexodraNotification === 'function' &&
        typeof handleNexodraNotificationError === 'function' &&
        typeof getNexodraNotificationDiagnostics === 'function';

    record(
        'Required notification functions',
        functionsAvailable,
        functionsAvailable
            ? 'All required functions are available.'
            : 'One or more required functions are missing.'
    );

    if (!functionsAvailable) {
        return results;
    }

    // Test 2: Permission check returns a valid result
    try {
        const status = checkNexodraNotificationPermission();

        const valid =
            status !== null &&
            typeof status === 'object' &&
            typeof status.supported === 'boolean' &&
            typeof status.canNotify === 'boolean' &&
            typeof status.permission === 'string';

        record(
            'Permission status structure',
            valid,
            status
        );
    } catch (error) {
        record('Permission status structure', false, error.message);
    }

    // Test 3: Diagnostics return expected fields
    try {
        const diagnostics = getNexodraNotificationDiagnostics();

        const valid =
            diagnostics !== null &&
            typeof diagnostics.supported === 'boolean' &&
            typeof diagnostics.permission === 'string' &&
            typeof diagnostics.canNotify === 'boolean' &&
            typeof diagnostics.secureContext === 'boolean';

        record(
            'Notification diagnostics',
            valid,
            diagnostics
        );
    } catch (error) {
        record('Notification diagnostics', false, error.message);
    }

    // Test 4: Error handler returns a failure result
    try {
        const result = handleNexodraNotificationError(
            new Error('Intentional BRICK 2H self-test'),
            'BRICK 2H SELF-TEST'
        );

        record(
            'Error handler',
            result !== null &&
            result.success === false &&
            typeof result.error === 'string',
            result
        );
    } catch (error) {
        record('Error handler', false, error.message);
    }

    // Display the report in the page if the report element exists
    const reportElement = document.getElementById(
        'nexodra-notification-test-results'
    );

    if (reportElement) {
        reportElement.textContent = results
            .map(result =>
                `${result.status} — ${result.test}: ${JSON.stringify(result.details)}`
            )
            .join('\n');
    }

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    console.info(
        `[BRICK 2H] Self-test complete: ${passed} passed, ${failed} failed.`,
        results
    );

    return results;
}


/* =========================================
   BRICK 2H — BUTTON CONNECTION DIAGNOSTIC
========================================= */

document.addEventListener('DOMContentLoaded', () => {

    const testButton = document.getElementById(
        'nexodra-run-notification-test'
    );

    if (!testButton) {
        console.error(
            'BRICK 2H — TEST BUTTON NOT FOUND.'
        );

        return;
    }

    console.log(
        'BRICK 2H — TEST BUTTON CONNECTED.'
    );

    testButton.addEventListener('click', async () => {

        console.log(
            'BRICK 2H — TEST BUTTON CLICKED.'
        );

        const output = document.getElementById(
            'nexodra-notification-test-results'
        );

        if (output) {
            output.textContent = 'Running notification tests...';
        }

        try {
            await runNexodraNotificationSelfTest();
            
            await runNexodraAndroidDiagnostics();

          
        } catch (error) {
            console.error(
                'BRICK 2H — SELF-TEST FAILED:',
                error
            );

            if (output) {
                output.textContent =
                    `SELF-TEST ERROR: ${error.message}`;
            }
        }
    });

});


/* =========================================
   BRICK 2I — REAL NOTIFICATION TEST
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById(
        'nexodra-test-real-notification'
    );

    const output = document.getElementById(
        'nexodra-real-notification-result'
    );

    if (!button || !output) {
        console.warn(
            'BRICK 2I — Test button or result element not found.'
        );
        return;
    }

    button.addEventListener('click', async () => {
        output.textContent = 'Checking notification permission…';

        try {
            const result =
                await requestNexodraNotificationPermission();

            if (!result.supported) {
                output.textContent =
                    'Notifications are not supported in this browser.';
                return;
            }

            if (!result.canNotify) {
                output.textContent =
                    `Notifications not enabled. Permission: ${result.permission}`;
                return;
            }

            const notification = displayNexodraNotification(
                'Nexodra Test',
                {
                    body: 'Your notification system is working!',
                    tag: 'nexodra-delivery-test'
                }
            );

            if (notification) {
                output.textContent =
                    'Notification created. Check whether your browser or device displayed it.';

                notification.onshow = () => {
                    console.info(
                        'BRICK 2I — Notification show event received.'
                    );
                };

                notification.onerror = (event) => {
                    console.error(
                        'BRICK 2I — Notification error event:',
                        event
                    );
                };
            } else {
                output.textContent =
                    'Notification could not be created. Check the console.';
            }
        } catch (error) {
            output.textContent =
                `Notification test failed: ${error.message}`;

            console.error('BRICK 2I — Test failed:', error);
        }
    });
});


/* =========================================
   NEXODRA — ON-SCREEN ANDROID DIAGNOSTICS
========================================= */

async function runNexodraAndroidDiagnostics() {
    const output = [];

    function report(label, value) {
        output.push(`${label}: ${value}`);
    }

    report('Browser', navigator.userAgent);
    report('Secure context', window.isSecureContext);
    report(
        'Notification API',
        'Notification' in window ? 'Available' : 'Unavailable'
    );
    report(
        'Permission',
        'Notification' in window
            ? Notification.permission
            : 'Not supported'
    );
    report(
        'Service worker API',
        'serviceWorker' in navigator ? 'Available' : 'Unavailable'
    );

    try {
        if ('serviceWorker' in navigator) {
            const registration =
                await navigator.serviceWorker.getRegistration();

            report('Registration found', !!registration);
            report(
                'Active worker',
                registration?.active?.state || 'None'
            );
            report(
                'showNotification method',
                typeof registration?.showNotification === 'function'
                    ? 'Available'
                    : 'Unavailable'
            );
        }
    } catch (error) {
        report(
            'Service worker error',
            `${error.name}: ${error.message}`
        );
    }

    const panel = document.getElementById(
        'nexodra-real-notification-result'
    );

    if (panel) {
        panel.textContent = output.join('\n');
    }

    return output;
}


 // =========================================
 // BRICK 2J — REAL NOTIFICATION DELIVERY TEST
 // =========================================

window.nexodraTestRealNotification = async function () {

    const output = document.getElementById(
        'nexodra-real-notification-result'
    );

    function report(message) {

        if (output) {
            output.textContent = message;
        }

        console.log('BRICK 2J — ' + message);

    }

    try {

        if (!('Notification' in window)) {

            report('FAILED: Notification API unavailable.');
            return;

        }

        if (Notification.permission !== 'granted') {

            report(
                'FAILED: Notification permission is ' +
                Notification.permission
            );

            return;

        }

        if (!('serviceWorker' in navigator)) {

            report('FAILED: Service workers unavailable.');
            return;

        }

        report('CHECKING ACTIVE SERVICE WORKER...');

        const registration =
            await navigator.serviceWorker.ready;

        if (!registration.active) {

            report('FAILED: No active service worker.');
            return;

        }

        if (
            typeof registration.showNotification !== 'function'
        ) {

            report(
                'FAILED: showNotification is unavailable.'
            );

            return;

        }

        await registration.showNotification(
            'Nexodra Notification Test',
            {
                body: 'BRICK 2J passed: real notification display was requested.',
                tag: 'nexodra-brick-2j-test',
                icon: './assets/nexodra-icon-192.png',
                data: {
                    source: 'BRICK 2J',
                    url: './index.html'
                }
            }
        );

        report(
            'SUCCESS: Chrome accepted the notification request.\n' +
            'Check your notification shade to confirm it appeared.'
        );

    } catch (error) {

        report(
            'NOTIFICATION TEST FAILED\n' +
            error.name + ': ' + error.message
        );

    }

};


 // =========================================
 // BRICK 2K — CONNECT REAL NOTIFICATION BUTTON
 // =========================================

(function () {

    'use strict';

    function nexodraConnectRealNotificationButton() {

        const button = document.getElementById(
            'nexodra-test-real-notification'
        );

        if (!button) {
            console.warn(
                'BRICK 2K — Real notification button not found.'
            );
            return;
        }

        if (button.dataset.nexodraBrick2KConnected === 'true') {
            return;
        }

        button.dataset.nexodraBrick2KConnected = 'true';

        button.addEventListener('click', async function () {

            if (
                typeof window.nexodraTestRealNotification !==
                'function'
            ) {

                const output = document.getElementById(
                    'nexodra-real-notification-result'
                );

                const message =
                    'FAILED: BRICK 2J is not loaded. ' +
                    'Check that its code is saved in app.js.';

                if (output) {
                    output.textContent = message;
                }

                console.error('BRICK 2K — ' + message);
                return;

            }

            button.disabled = true;
            button.textContent = 'Testing Notification...';

            try {

                await window.nexodraTestRealNotification();

            } catch (error) {

                const output = document.getElementById(
                    'nexodra-real-notification-result'
                );

                if (output) {
                    output.textContent =
                        'TEST FAILED\n' +
                        error.name + ': ' + error.message;
                }

                console.error(
                    'BRICK 2K — Notification test failed:',
                    error
                );

            } finally {

                button.disabled = false;
                button.textContent = 'Test Real Notification';

            }

        });

        console.log(
            'BRICK 2K — Real notification button connected.'
        );

    }

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            nexodraConnectRealNotificationButton,
            { once: true }
        );

    } else {

        nexodraConnectRealNotificationButton();

    }

})();



/* =========================================
   NEXODRA AUTH - BRICK 2A
   CREATE ACCOUNT
========================================= */

document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signupForm');

    const signupName = document.getElementById('signupName');
    const signupCountry = document.getElementById('signupCountry');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');

    const signupBtn = document.getElementById('signupBtn');
    const signupMessage = document.getElementById('signupMessage');


    // Stop safely if the signup screen is not present
    if (
        !signupForm ||
        !signupName ||
        !signupEmail ||
        !signupPassword ||
        !signupBtn ||
        !signupMessage
    ) {
        return;
    }


    signupForm.addEventListener('submit', async (event) => {

        event.preventDefault();


        const name =
            signupName.value.trim();

      const countryCode = signupCountry
    ? signupCountry.value.trim()
    : '';

const countryName = signupCountry &&
    signupCountry.selectedIndex >= 0
        ? signupCountry.options[
            signupCountry.selectedIndex
          ].textContent.trim()
        : '';

        const email =
            signupEmail.value.trim();

        const password =
            signupPassword.value;


        // Clear previous message
        signupMessage.textContent = '';

        signupMessage.style.color = '#dc2626';


        // Basic validation
        if (!name) {

            signupMessage.textContent =
                'Please enter your name.';

            signupName.focus();

            return;
        }


        if (!email) {

            signupMessage.textContent =
                'Please enter your email address.';

            signupEmail.focus();

            return;
        }


        if (password.length < 6) {

            signupMessage.textContent =
                'Password must be at least 6 characters.';

            signupPassword.focus();

            return;
        }

      if (!countryCode || !countryName) {
    signupMessage.textContent =
        'Please select your country of operation.';

    document.getElementById('signupCountryTrigger')?.focus();

    return;
}

        // Loading state
        signupBtn.disabled = true;

        signupBtn.innerHTML = `
            <span>Creating account...</span>
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;


        try {
  
            /*
             * Create the Supabase Auth account.
             *
             * The name is stored as user metadata.
             */
            const {
    data,
    error
} = await supabaseClient.auth.signUp({

    email: email,

    password: password,

    options: {

        emailRedirectTo:
            'http://localhost:8158',

       data: {
    name: name,
    country: countryName,
    country_code: countryCode
} 

    }

});
   
            // Supabase returned an error
            if (error) {

                console.error(
                    'Signup error:',
                    error
                );

                signupMessage.textContent =
                    error.message ||
                    'Unable to create your account.';

                return;
            }


            /*
             * Account created successfully.
             *
             * If email confirmation is enabled,
             * Supabase normally returns a user but
             * no active session yet.
             */
            if (data.user && !data.session) {

                signupMessage.style.color =
                    '#16a34a';

                signupMessage.textContent =
                    'Account created! Check your email to confirm your account.';

                signupForm.reset();

                return;
            }


            /*
             * If email confirmation is disabled,
             * a session may be available immediately.
             */
            if (data.user && data.session) {

                signupMessage.style.color =
                    '#16a34a';

                signupMessage.textContent =
                    'Account created successfully!';

                /*
                 * We are NOT switching screens yet.
                 *
                 * That will be handled in Brick 3
                 * when we build the login/session system.
                 */

                signupForm.reset();

                return;
            }


            signupMessage.textContent =
                'Account creation completed. Please try signing in.';

        } catch (error) {

            console.error(
                'Unexpected signup error:',
                error
            );

            signupMessage.textContent =
                'Something went wrong. Please try again.';

        } finally {

            // Restore button
            signupBtn.disabled = false;

            signupBtn.innerHTML = `
                <span>Create Account</span>
                <i class="fa-solid fa-arrow-right"></i>
            `;

        }

    });

});
/* =========================================
   NEXODRA AUTH - PANEL SWITCHING
========================================= */

document.addEventListener('DOMContentLoaded', () => {

    const loginPanel =
        document.getElementById('loginPanel');

    const signupPanel =
        document.getElementById('signupPanel');

    const showSignupBtn =
        document.getElementById('showSignupBtn');

    const showLoginBtn =
        document.getElementById('showLoginBtn');


    if (
        !loginPanel ||
        !signupPanel ||
        !showSignupBtn ||
        !showLoginBtn
    ) {
        return;
    }


    // Open Create Account
    showSignupBtn.addEventListener('click', () => {

        loginPanel.classList.remove('active');

        signupPanel.classList.add('active');

        // Clear old messages
        const loginMessage =
            document.getElementById('loginMessage');

        if (loginMessage) {
            loginMessage.textContent = '';
        }

    });


    // Return to Sign In
    showLoginBtn.addEventListener('click', () => {

        signupPanel.classList.remove('active');

        loginPanel.classList.add('active');

        // Clear old messages
        const signupMessage =
            document.getElementById('signupMessage');

        if (signupMessage) {
            signupMessage.textContent = '';
        }

    });

});
/* =========================================
   AUTH PASSWORD VISIBILITY
========================================= */

document.addEventListener('DOMContentLoaded', () => {

    function setupPasswordToggle(
        toggleId,
        inputId
    ) {

        const toggle =
            document.getElementById(toggleId);

        const input =
            document.getElementById(inputId);

        if (!toggle || !input) {
            return;
        }


        toggle.addEventListener('click', () => {

            const isPassword =
                input.type === 'password';

            input.type =
                isPassword ? 'text' : 'password';


            const icon =
                toggle.querySelector('i');

            if (icon) {

                icon.className =
                    isPassword
                        ? 'fa-regular fa-eye-slash'
                        : 'fa-regular fa-eye';

            }

        });

    }


    setupPasswordToggle(
        'loginPasswordToggle',
        'loginPassword'
    );


    setupPasswordToggle(
        'signupPasswordToggle',
        'signupPassword'
    );

});

/* =========================================
   NEXODRA AUTH - BRICK 2B
   REAL SIGN IN
========================================= */

document.addEventListener('DOMContentLoaded', () => {

    const loginForm =
        document.getElementById('loginForm');

    const loginEmail =
        document.getElementById('loginEmail');

    const loginPassword =
        document.getElementById('loginPassword');

    const loginBtn =
        document.getElementById('loginBtn');

    const loginMessage =
        document.getElementById('loginMessage');


    // Stop safely if login elements are missing
    if (
        !loginForm ||
        !loginEmail ||
        !loginPassword ||
        !loginBtn ||
        !loginMessage
    ) {
        return;
    }


    loginForm.addEventListener('submit', async (event) => {

        event.preventDefault();


        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        // Clear previous message
        loginMessage.textContent = '';
        loginMessage.style.color = '#dc2626';


        // Validation
        if (!email) {

            loginMessage.textContent =
                'Please enter your email address.';

            loginEmail.focus();

            return;
        }


        if (!password) {

            loginMessage.textContent =
                'Please enter your password.';

            loginPassword.focus();

            return;
        }


        // Loading state
        loginBtn.disabled = true;

        loginBtn.innerHTML = `
            <span>Signing in...</span>
            <i class="fa-solid fa-spinner fa-spin"></i>
        `;


        try {

            /*
             * Sign in with Supabase
             */
            const {
                data,
                error
            } = await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


            // Login failed
            if (error) {

                console.error(
                    'Login error:',
                    error
                );

                loginMessage.textContent =
                    error.message ||
                    'Unable to sign in. Please check your details.';

                return;
            }


            // Make sure we actually received a session
if (!data.session) {

    loginMessage.textContent =
        'Sign in was not completed. Please try again.';

    return;
}


/* =========================================
   ODROP AUTH R1 — REMEMBER THIS DEVICE
========================================= */

localStorage.setItem(
    ODROP_REMEMBER_KEY,
    'true'
);

localStorage.setItem(
    ODROP_REMEMBER_EMAIL_KEY,
    email
);

console.log(
    'ODROP AUTH R1 — Login remembered locally.'
);


/* =========================================
   LOGIN SUCCESS
========================================= */

console.log(
    'NEXODRA login successful:',
    data.user
);


            // Success message
            loginMessage.style.color =
                '#16a34a';

            loginMessage.textContent =
                'Signed in successfully!';


            /*
 * Open NEXODRA app after successful login.
 */
setTimeout(() => {

    // Hide authentication screen
    const authScreen =
        document.getElementById('authScreen');

    if (authScreen) {
        authScreen.style.display = 'none';
    }


    // Hide all app screens
    document
        .querySelectorAll('.screen')
        .forEach(screen => {
            screen.classList.remove('active');
        });


    // Open Store
    const storeScreen =
        document.getElementById('storeScreen');

    if (storeScreen) {
        storeScreen.classList.add('active');
    }


    // Update top title
    const screenTitle =
        document.getElementById('screenTitle');

    if (screenTitle) {
        screenTitle.textContent = 'Store';
    }


    // Activate Store navigation
    document
        .querySelectorAll('.nav-btn')
        .forEach(button => {
            button.classList.remove('active');
        });


    const storeNav =
        document.querySelector(
            '.nav-btn[data-target="storeScreen"]'
        );

    if (storeNav) {
        storeNav.classList.add('active');
    }


}, 500);


        } catch (error) {

            console.error(
                'Unexpected login error:',
                error
            );

            loginMessage.textContent =
                'Something went wrong. Please try again.';

        } finally {

            // Restore button
            loginBtn.disabled = false;

            loginBtn.innerHTML = `
                <span>Sign In</span>
                <i class="fa-solid fa-arrow-right"></i>
            `;

        }

    });

});

/* =========================================
   NEXODRA AUTH - BRICK 2C
   RESTORE LOGIN SESSION
========================================= */

document.addEventListener('DOMContentLoaded', async () => {

    /*
     * =========================================
     * NEXODRA — PUBLIC STORE AUTH BYPASS
     * BRICK A
     * =========================================
     *
     * A customer opening a shared public-store
     * link must NOT enter the seller application
     * or be required to sign in just to view the
     * store.
     *
     * Example:
     *
     * /store/odro
     *
     * must open the public storefront directly.
     */

    /*
 * =========================================
 * NEXODRA — PUBLIC STORE AUTH BYPASS
 * BRICK A — CORRECTED
 * =========================================
 *
 * GitHub Pages uses:
 *
 * /nexodra-seller-app/store/odro
 *
 * Brick B normalizes that route to:
 *
 * /store/odro
 *
 * Therefore this check MUST use
 * currentPath instead of
 * window.location.pathname.
 */

if (
    currentPath.startsWith('/store/')
) {

    console.log(
        'BRICK A — Public store detected.'
    );

    /*
     * Public shared-store links are NOT
     * seller preview mode.
     */

    isStorePreviewMode = false;

    /*
     * Hide authentication screen.
     */

    const publicAuthScreen =
        document.getElementById(
            'authScreen'
        );

    if (publicAuthScreen) {

        publicAuthScreen.style.display =
            'none';

    }

    /*
     * IMPORTANT:
     *
     * The public-store route handler
     * earlier in app.js is responsible
     * for calling showPublicStore().
     *
     * We only stop the normal login
     * restoration here.
     */

    console.log(
    'BRICK A — Authentication restoration skipped for public store.'
);

// =========================================
// C8-B — PUBLIC STORE ROUTING COMPLETE
// =========================================

completeNexodraStartup();

return;

    return;

}  


    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session check error:",
                error
            );

            return;
        }


        const session =
            data.session;


        // No active Supabase session
if (!session) {

    const rememberedLogin =
        localStorage.getItem(
            ODROP_REMEMBER_KEY
        );

    const rememberedEmail =
        localStorage.getItem(
            ODROP_REMEMBER_EMAIL_KEY
        );

    console.log(
        'ODROP AUTH R1 — No active Supabase session.'
    );

    console.log(
        'ODROP AUTH R1 — Remembered login:',
        rememberedLogin === 'true'
    );


    /*
     * IMPORTANT:
     *
     * The local remember flag is NOT authentication.
     *
     * We never automatically sign in using
     * localStorage alone.
     */

    const loginEmail =
        document.getElementById(
            'loginEmail'
        );

    if (
        rememberedLogin === 'true' &&
        rememberedEmail &&
        loginEmail
    ) {

        loginEmail.value =
            rememberedEmail;

        console.log(
            'ODROP AUTH R1 — Remembered email restored.'
        );
    }

  // =========================================
// C8-E — NEW USER ONBOARDING DECISION
// =========================================

if (
    !hasSeenNexodraOnboarding()
) {

    showNexodraOnboarding();

} else {

    console.log(
        'C8-E — Onboarding already seen; opening login.'
    );

}

    // =========================================
// C8-J — FIRST-TIME USER ROUTING DECISION
// =========================================

if (
    hasSeenNexodraOnboarding()
) {

    console.log(
        'C8-J — Returning visitor detected; opening login.'
    );

    if (authScreen) {
        authScreen.classList.add(
            'active'
        );
    }

} else {

    console.log(
        'C8-J — First-time visitor detected; opening onboarding.'
    );

    showNexodraOnboarding();

}

// =========================================
// C8-J — AUTH ROUTING COMPLETE
// =========================================

completeNexodraStartup();

return;
}


        console.log(
            "Existing NEXODRA user:",
            session.user.email
        );

      // BRICK 1D — RESTORE BARCODE CACHE
odropBarcodeCache =
    loadOdropBarcodeCache(
        session.user.id
    );

odropBarcodeCacheUserId =
    String(session.user.id);

console.log(
    'BRICK 1D — Barcode cache restored for user:',
    session.user.id
);


        /*
         * User already logged in
         * Open Store automatically
         */


        const authScreen =
            document.getElementById(
                'authScreen'
            );


        if (authScreen) {

            authScreen.style.display =
                'none';

        }


        // Hide all screens
        document
            .querySelectorAll('.screen')
            .forEach(screen => {

                screen.classList.remove(
                    'active'
                );

            });


        // Open Store

        const storeScreen =
            document.getElementById(
                'storeScreen'
            );


        if (storeScreen) {

            storeScreen.classList.add(
                'active'
            );

        }


        // Update title

        const screenTitle =
            document.getElementById(
                'screenTitle'
            );


        if (screenTitle) {

            screenTitle.textContent =
                'Store';

        }


        // Activate Store button

        document
            .querySelectorAll('.nav-btn')
            .forEach(btn => {

                btn.classList.remove(
                    'active'
                );

            });


        const storeButton =
            document.querySelector(
                '.nav-btn[data-target="storeScreen"]'
            );


        if (storeButton) {

            storeButton.classList.add(
                'active'
            );

        }

      // =========================================
// C8-B — EXISTING USER ROUTING COMPLETE
// =========================================

completeNexodraStartup();
      

    }

    catch(error) {

    console.error(
        "Unexpected session error:",
        error
    );

    // =========================================
    // C8-B — FAIL-SAFE STARTUP RELEASE
    // =========================================

    completeNexodraStartup();

}


});

/* =========================================
   NEXODRA AUTH - BRICK 2D
   LOGOUT SYSTEM
========================================= */

document.addEventListener('DOMContentLoaded', () => {


    const logoutButton =
        document.querySelector('.logout-btn');


    const logoutModal =
        document.getElementById('logoutModal');


    const confirmLogoutBtn =
        document.getElementById('confirmLogoutBtn');


    const cancelLogoutBtn =
        document.getElementById('cancelLogoutBtn');



    if (!logoutButton) {

        console.log(
            "Logout button not found"
        );

        return;

    }



    // Open logout confirmation

    logoutButton.addEventListener('click', () => {


        if (logoutModal) {

            logoutModal.classList.add(
                'active'
            );

        }


    });



    // Cancel logout

    if (cancelLogoutBtn) {


        cancelLogoutBtn.addEventListener(
            'click',
            () => {


                logoutModal.classList.remove(
                    'active'
                );


            }
        );


    }



    // Confirm logout

    if (confirmLogoutBtn) {


        confirmLogoutBtn.addEventListener(
            'click',
            async () => {


                 try {

    /* =========================================
       ODROP AUTH R1 — CANCEL REMEMBER LOGIN
    ========================================= */

    localStorage.removeItem(
        ODROP_REMEMBER_KEY
    );

    localStorage.removeItem(
        ODROP_REMEMBER_EMAIL_KEY
    );

    console.log(
        'ODROP AUTH R1 — Local remember login cleared.'
    );


    /* =========================================
       SIGN OUT FROM SUPABASE
    ========================================= */

    const {
        error
    } =
    await supabaseClient.auth.signOut();



                    if (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                        return;

                    }



                    console.log(
                        "Logged out successfully"
                    );


                    // Reload cleanly

                    window.location.reload();



                }


                catch(error) {


                    console.error(
                        "Logout failed:",
                        error
                    );


                }


            }
        );


    }



});

loadNotifications();




/* =========================================
   BRICK 3 — STORE CARD SALES GRAPH
   CONNECTED TO EXISTING SALES LOADER
   ========================================= */

async function updateStoreCardSalesGraph() {

    const svg =
        document.getElementById('storeSalesGraph');

    if (!svg) return;


    /* -----------------------------------------
       Get the SAME sales data used by the app
       ----------------------------------------- */

    const period =
    window.nexodraSelectedSalesPeriod || 'month';

const sales =
    await loadSellerSales(period);


    /* -----------------------------------------
       Make sure we have usable data
       ----------------------------------------- */

    if (
        !Array.isArray(sales) ||
        sales.length === 0
    ) {

        svg.innerHTML = '';

        return;

    }


    /* -----------------------------------------
       Use the REAL "total" field
       from the sales table
       ----------------------------------------- */

    const values =
        sales
            .map(sale =>
                Number(sale.total)
            )
            .filter(value =>
                Number.isFinite(value)
            );


    if (values.length === 0) {

        svg.innerHTML = '';

        return;

    }


    /* -----------------------------------------
       Graph dimensions
       ----------------------------------------- */

    const width = 1000;
    const height = 82;

    const topPadding = 8;
    const bottomPadding = 8;

    const graphHeight =
        height -
        topPadding -
        bottomPadding;


    /* -----------------------------------------
       Find min / max
       ----------------------------------------- */

    const max =
        Math.max(...values);

    const min =
        Math.min(...values);

    const range =
        max - min || 1;


    /* -----------------------------------------
       Create points
       ----------------------------------------- */

    const points =
        values.map(
            (value, index) => {

                const x =
                    values.length === 1
                        ? width / 2
                        : (
                            index /
                            (values.length - 1)
                        ) * width;


                const normalized =
                    (value - min) /
                    range;


                const y =
                    height -
                    bottomPadding -
                    (
                        normalized *
                        graphHeight
                    );


                return {
                    x,
                    y
                };

            }
        );


    /* -----------------------------------------
       Create smooth line
       ----------------------------------------- */

    let linePath = '';


    points.forEach(
        (point, index) => {

            if (index === 0) {

                linePath +=
                    `M ${point.x} ${point.y}`;

                return;

            }


            const previous =
                points[index - 1];


            const controlX =
                (
                    previous.x +
                    point.x
                ) / 2;


            linePath +=
                ` C ${controlX} ${previous.y},
                  ${controlX} ${point.y},
                  ${point.x} ${point.y}`;

        }
    );


    /* -----------------------------------------
       Create filled area
       ----------------------------------------- */

    const areaPath =
        linePath +
        ` L ${width} ${height}` +
        ` L 0 ${height} Z`;


    /* -----------------------------------------
       Clear old graph
       ----------------------------------------- */

    svg.innerHTML = '';


    /* =========================================
       SVG DEFINITIONS
       ========================================= */

    const defs =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'defs'
        );


    const gradient =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'linearGradient'
        );


    gradient.setAttribute(
        'id',
        'storeSalesAreaGradient'
    );

    gradient.setAttribute(
        'x1',
        '0'
    );

    gradient.setAttribute(
        'y1',
        '0'
    );

    gradient.setAttribute(
        'x2',
        '0'
    );

    gradient.setAttribute(
        'y2',
        '1'
    );


    const topStop =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'stop'
        );


    topStop.setAttribute(
        'offset',
        '0%'
    );

    topStop.setAttribute(
        'stop-color',
        '#4ade80'
    );

    topStop.setAttribute(
        'stop-opacity',
        '0.28'
    );


    const bottomStop =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'stop'
        );


    bottomStop.setAttribute(
        'offset',
        '100%'
    );

    bottomStop.setAttribute(
        'stop-color',
        '#4ade80'
    );

    bottomStop.setAttribute(
        'stop-opacity',
        '0'
    );


    gradient.appendChild(
        topStop
    );

    gradient.appendChild(
        bottomStop
    );

    defs.appendChild(
        gradient
    );

  /* =========================================
   SOFT GRAPH GLOW FILTER
   ========================================= */

const glowFilter =
    document.createElementNS(
        'http://www.w3.org/2000/svg',
        'filter'
    );

glowFilter.setAttribute(
    'id',
    'storeSalesGraphGlow'
);

glowFilter.setAttribute(
    'x',
    '-50%'
);

glowFilter.setAttribute(
    'y',
    '-100%'
);

glowFilter.setAttribute(
    'width',
    '200%'
);

glowFilter.setAttribute(
    'height',
    '300%'
);


const blur =
    document.createElementNS(
        'http://www.w3.org/2000/svg',
        'feGaussianBlur'
    );

blur.setAttribute(
    'stdDeviation',
    '3.5'
);


glowFilter.appendChild(
    blur
);

defs.appendChild(
    glowFilter
);

    svg.appendChild(
        defs
    );


    /* =========================================
       GREEN FILLED AREA
       ========================================= */

    const area =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        );


    area.setAttribute(
        'd',
        areaPath
    );

    area.setAttribute(
        'fill',
        'url(#storeSalesAreaGradient)'
    );

    svg.appendChild(
        area
    );


    /* =========================================
       MAIN GREEN SALES LINE
       ========================================= */

    const line =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        );


    line.setAttribute(
        'd',
        linePath
    );

    line.setAttribute(
        'fill',
        'none'
    );

    line.setAttribute(
        'stroke',
        '#4ade80'
    );

    line.setAttribute(
        'stroke-width',
        '5'
    );

    line.setAttribute(
        'stroke-linecap',
        'round'
    );

    line.setAttribute(
        'stroke-linejoin',
        'round'
    );

    svg.appendChild(
        line
    );

  /* =========================================
   SOFT ALWAYS-ON LINE GLOW
   ========================================= */

const glowLine = line.cloneNode(true);

glowLine.setAttribute(
    'class',
    'store-sales-line-glow'
);

glowLine.setAttribute(
    'filter',
    'url(#storeSalesGraphGlow)'
);

glowLine.setAttribute(
    'stroke-width',
    '7'
);

glowLine.setAttribute(
    'opacity',
    '0.22'
);

svg.insertBefore(glowLine, line);


/* =========================================
   GRAPH POINTS
   ========================================= */

points.forEach(point => {
    const circle =
        document.createElementNS(
            'http://www.w3.org/2000/svg',
            'circle'
        );

    circle.setAttribute('cx', point.x);
    circle.setAttribute('cy', point.y);
    circle.setAttribute('r', '3');
    circle.setAttribute('fill', '#4ade80');

    circle.setAttribute(
        'class',
        'store-sales-point'
    );

    svg.appendChild(circle);
});


/* =========================================
   MOVING SALES PULSE
   Follows the EXACT EXISTING LINE PATH
   ========================================= */

const pulseGroup =
    document.createElementNS(
        'http://www.w3.org/2000/svg',
        'g'
    );

pulseGroup.setAttribute(
    'class',
    'store-sales-pulse'
);

const pulseHalo =
    document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
    );

pulseHalo.setAttribute('r', '10');
pulseHalo.setAttribute('fill', '#4ade80');
pulseHalo.setAttribute('opacity', '0.18');

pulseHalo.setAttribute(
    'filter',
    'url(#storeSalesGraphGlow)'
);

const pulseCore =
    document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
    );

pulseCore.setAttribute(
    'r',
    '3.2'
);

pulseCore.setAttribute(
    'fill',
    '#ffffff'
);

pulseGroup.appendChild(pulseHalo);
pulseGroup.appendChild(pulseCore);

svg.appendChild(pulseGroup);


/* =========================================
   ANIMATION ENGINE
   ========================================= */

if (
    window.__nexodraSalesGraphAnimationFrame
) {
    cancelAnimationFrame(
        window.__nexodraSalesGraphAnimationFrame
    );
}

const pathLength =
    line.getTotalLength();

const pointLengths =
    points.map(point => {

        let bestLength = 0;
        let bestDistance = Infinity;

        const samples = 240;

        for (
            let i = 0;
            i <= samples;
            i++
        ) {

            const length =
                pathLength *
                (i / samples);

            const pathPoint =
                line.getPointAtLength(
                    length
                );

            const dx =
                pathPoint.x -
                point.x;

            const dy =
                pathPoint.y -
                point.y;

            const distance =
                (dx * dx) +
                (dy * dy);

            if (
                distance <
                bestDistance
            ) {

                bestDistance =
                    distance;

                bestLength =
                    length;
            }
        }

        return bestLength;
    });


const cycleDuration = 6200;

const startTime =
    performance.now();


function animateSalesPulse(now) {

    const elapsed =
        (now - startTime) %
        cycleDuration;

    const progress =
        elapsed /
        cycleDuration;


    const currentLength =
        progress *
        pathLength;


    const position =
        line.getPointAtLength(
            currentLength
        );


    pulseGroup.setAttribute(
        'transform',
        `translate(${position.x} ${position.y})`
    );


    let nearestDistance =
        Infinity;


    pointLengths.forEach(length => {

        const distance =
            Math.abs(
                currentLength -
                length
            );

        if (
            distance <
            nearestDistance
        ) {

            nearestDistance =
                distance;
        }

    });


    const pointZone =
        pathLength *
        0.025;


    const atPoint =
        nearestDistance <
        pointZone;


    let pulseStrength =
        0.45;


    if (atPoint) {

        const pulseProgress =
            1 -
            (
                nearestDistance /
                pointZone
            );

        pulseStrength =
            0.45 +
            (
                pulseProgress *
                0.55
            );
    }


    const pulseWave =
    (Math.sin(
        progress *
        Math.PI *
        4
    ) + 1) / 2;


/*
    Never goes to zero.

    Normal:
    0.50

    Strongest:
    0.70
*/
const glowLevel =
    0.50 +
    (
        pulseWave *
        0.20
    );


    pulseHalo.setAttribute(
        'opacity',
        String(
            0.14 +
            (
                pulseStrength *
                0.18
            )
        )
    );


    pulseHalo.setAttribute(
        'r',
        String(
            8 +
            (
                pulseStrength *
                5
            )
        )
    );


    pulseCore.setAttribute(
        'r',
        String(
            2.8 +
            (
                pulseStrength *
                1.1
            )
        )
    );


    glowLine.setAttribute(
    'opacity',
    String(
        0.40 +
        (
            glowLevel -
            0.80
        ) *
        pulseStrength
    )
);


    window.__nexodraSalesGraphAnimationFrame =
        requestAnimationFrame(
            animateSalesPulse
        );
}


window.__nexodraSalesGraphAnimationFrame =
    requestAnimationFrame(
        animateSalesPulse
    );


    /* =========================================
       GRAPH POINTS
       ========================================= */

    points.forEach(
        point => {

            const circle =
                document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'circle'
                );


            circle.setAttribute(
                'cx',
                point.x
            );

            circle.setAttribute(
                'cy',
                point.y
            );

            circle.setAttribute(
                'r',
                '3'
            );

            circle.setAttribute(
                'fill',
                '#4ade80'
            );


            svg.appendChild(
                circle
            );

        }
    );

}


/* =========================================
   START THE STORE CARD GRAPH
   ========================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        updateStoreCardSalesGraph();

    }
);



// =========================================
// CUSTOMER DIRECT MESSAGE NAVIGATION
// BRICK C4-A
// =========================================

const publicmessageNav =
    document.getElementById(
        'publicmessageNav'
    );


const publicCustomerMessage =
    document.getElementById(
        'publicCustomerMessage'
    );


const publicMessageBackBtn =
    document.getElementById(
        'customerChatBackBtn'
    );


const publicMessageStoreName =
    document.getElementById(
        'publicMessageStoreName'
    );

// =========================================
// C9-A — REAL STORE CHAT HEADER
// =========================================

const customerChatSellerAvatar =
    document.getElementById(
        'customerChatSellerAvatar'
    );

const customerChatSellerName =
    document.getElementById(
        'customerChatSellerName'
    );


/*
 * OPEN CUSTOMER MESSAGE SCREEN
 */

if (
    publicContactNav &&
    publicCustomerMessage
) {

    publicContactNav.addEventListener(
        'click',
        () => {

            console.log(
                'BRICK CUSTOMER MESSAGE C4-A — Message button clicked.'
            );


            /*
             * Hide customer pages.
             */

            const publicCart =
                document.getElementById(
                    'publicCustomerCart'
                );


            const publicCheckout =
                document.getElementById(
                    'publicCustomerCheckout'
                );


            const publicProductDetail =
                document.getElementById(
                    'publicProductDetail'
                );


            if (publicCart) {

                publicCart.style.display =
                    'none';

            }


            if (publicCheckout) {

                publicCheckout.style.display =
                    'none';

            }


            if (publicProductDetail) {

                publicProductDetail.style.display =
                    'none';

            }


            /*
             * Hide storefront content.
             */

            const publicStoreContent =
                document.querySelector(
                    '.public-store-content'
                );


            if (publicStoreContent) {

                publicStoreContent.style.display =
                    'none';

            }


            /*
             * Hide store header if present.
             */

            const publicHeader =
                document.querySelector(
                    '.public-store-header'
                );


            if (publicHeader) {

                publicHeader.style.display =
                    'none';

            }


            /*
             * Show message screen.
             */

            publicCustomerMessage.style.display =
                'flex';


            /*
             * Get current store name.
             */

            // =========================================
// C9-A — APPLY REAL STORE CHAT IDENTITY
// =========================================

if (customerChatSellerName) {

    customerChatSellerName.textContent =
        storeName ||
        'Store';

}

if (publicMessageStoreName) {

    publicMessageStoreName.textContent =
        storeName ||
        'Store';

}

// =========================================
// C9-A — APPLY REAL STORE PROFILE IMAGE
// =========================================

if (customerChatSellerAvatar) {

    const profileImageUrl =
        currentStoreProfileImageUrl || '';

    if (profileImageUrl) {

        customerChatSellerAvatar.src =
            profileImageUrl;

        customerChatSellerAvatar.alt =
            storeName || 'Store logo';

    } else {

        customerChatSellerAvatar.removeAttribute(
            'src'
        );

        customerChatSellerAvatar.alt =
            'Store logo';

    }

}


            console.log(
                'BRICK CUSTOMER MESSAGE C4-A — Message screen opened.',
                {
                    store:
                        storeName || 'Store',

                    seller:
                        currentStoreOwnerId
                }
            );

        }
    );

}


/*
 * BACK TO STORE
 */

if (publicMessageBackBtn) {

    publicMessageBackBtn.addEventListener(
        'click',
        () => {

            console.log(
                'BRICK CUSTOMER MESSAGE C4-A — Back to store.'
            );


            /*
             * Hide message screen.
             */

            if (publicCustomerMessage) {

                publicCustomerMessage.style.display =
                    'none';

            }


            /*
             * Restore store header.
             */

            const publicHeader =
                document.querySelector(
                    '.public-store-header'
                );


            if (publicHeader) {

                publicHeader.style.display =
                    '';

            }


            /*
             * Restore storefront content.
             */

            const publicStoreContent =
                document.querySelector(
                    '.public-store-content'
                );


            if (publicStoreContent) {

                publicStoreContent.style.display =
                    '';

            }

        }
    );

}

// =========================================
// BRICK H — CUSTOMER PERSISTENT MESSAGING
// =========================================
//
// Customer public-store chat.
//
// Uses:
//
// conversations
// messages
//
// No new tables.
// =========================================


// =========================================
// CUSTOMER CHAT ELEMENTS
// =========================================

const customerChatMessages =
    document.getElementById(
        'customerChatMessages'
    );

const customerChatInput =
    document.getElementById(
        'customerChatInput'
    );

const customerChatSendBtn =
    document.getElementById(
        'customerChatSendBtn'
    );

// =========================================
// C9-B — CUSTOMER PRODUCT ATTACHMENT
// =========================================

const customerChatAttachProductBtn =
    document.getElementById(
        'customerChatAttachProductBtn'
    );

let customerChatAttachedProduct = null;

// =========================================
// C9-D — CUSTOMER PRODUCT ATTACHMENT PREVIEW
// =========================================

const customerChatAttachmentPreview =
    document.getElementById(
        'customerChatAttachmentPreview'
    );


function renderCustomerChatAttachment() {

    if (
        !customerChatAttachmentPreview
    ) {
        return;
    }


    /*
     * No product attached.
     */
    if (
        !customerChatAttachedProduct
    ) {

        customerChatAttachmentPreview.innerHTML =
            '';

        customerChatAttachmentPreview.hidden =
            true;

        return;
    }


    const product =
        customerChatAttachedProduct;


    const productTitle =
        product.title ||
        'Untitled Product';


    const productImage =
        product.image ||
        '';


    const productPrice =
        Number(
            product.price || 0
        );


    const productId =
        product.id ||
        '';


    customerChatAttachmentPreview.innerHTML = `

        <div
            class="customer-chat-attachment-card"
            data-product-id="${productId}"
        >

            <div class="customer-chat-attachment-image">

                ${
                    productImage

                    ? `
                        <img
                            src="${productImage}"
                            alt="${productTitle}"
                        >
                    `

                    : `
                        <span>
                            ${
                                product.emoji ||
                                '📦'
                            }
                        </span>
                    `
                }

            </div>


            <div class="customer-chat-attachment-info">

                <span
                    class="customer-chat-attachment-label"
                >
                    PRODUCT
                </span>

                <strong>
                    ${productTitle}
                </strong>

                <span
                    class="customer-chat-attachment-price"
                >
                    ${formatCurrency(productPrice)}
                </span>

            </div>


            <button
                type="button"
                class="customer-chat-attachment-remove"
                id="customerChatRemoveAttachmentBtn"
                aria-label="Remove attached product"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>

        </div>

    `;


    customerChatAttachmentPreview.hidden =
        false;


    console.log(
        'BRICK C9-D — Product attachment preview rendered:',
        product
    );


    const removeButton =
        document.getElementById(
            'customerChatRemoveAttachmentBtn'
        );


    if (removeButton) {

        removeButton.addEventListener(
            'click',
            event => {

                event.preventDefault();
                event.stopPropagation();


                customerChatAttachedProduct =
                    null;


                renderCustomerChatAttachment();


                console.log(
                    'BRICK C9-D — Product attachment removed.'
                );

            }
        );

    }

}

// =========================================
// C9-C — CUSTOMER PRODUCT PICKER
// =========================================

const customerProductPicker =
    document.getElementById(
        'customerProductPicker'
    );

const customerProductPickerGrid =
    document.getElementById(
        'customerProductPickerGrid'
    );

const customerProductPickerClose =
    document.getElementById(
        'customerProductPickerClose'
    );

const customerProductPickerBackdrop =
    document.querySelector(
        '.customer-product-picker-backdrop'
    );


function openCustomerProductPicker() {

    if (!customerProductPicker) {
        return;
    }

    console.log(
        'BRICK C9-C — Opening customer product picker.'
    );

    renderCustomerProductPicker();

    customerProductPicker.classList.add(
        'active'
    );

    customerProductPicker.setAttribute(
        'aria-hidden',
        'false'
    );
}


function closeCustomerProductPicker() {

    if (!customerProductPicker) {
        return;
    }

    customerProductPicker.classList.remove(
        'active'
    );

    customerProductPicker.setAttribute(
        'aria-hidden',
        'true'
    );

    console.log(
        'BRICK C9-C — Product picker closed.'
    );
}


function renderCustomerProductPicker() {

    if (!customerProductPickerGrid) {
        return;
    }

    const availableProducts =
        Array.isArray(publicProducts)
            ? publicProducts.filter(
                product =>
                    Number(product.stock || 0) > 0
            )
            : [];

    if (
        availableProducts.length === 0
    ) {

        customerProductPickerGrid.innerHTML = `
            <div class="customer-product-picker-empty">

                <i class="fa-solid fa-box-open"></i>

                <strong>
                    No products available
                </strong>

                <span>
                    This store has no published products
                    available to attach.
                </span>

            </div>
        `;

        return;
    }


    customerProductPickerGrid.innerHTML =
        availableProducts.map(
            product => {

                const image =
                    product.image ||
                    '';

                const title =
                    product.title ||
                    'Untitled Product';

                const price =
                    Number(
                        product.price || 0
                    );

                return `
                    <button
                        type="button"
                        class="customer-product-picker-card"
                        data-product-id="${product.id}"
                    >

                        <div
                            class="customer-product-picker-image"
                        >

                            ${
                                image
                                    ? `
                                        <img
                                            src="${image}"
                                            alt="${title}"
                                        >
                                    `
                                    : `
                                        <span>
                                            ${
                                                product.emoji ||
                                                '📦'
                                            }
                                        </span>
                                    `
                            }

                        </div>

                        <div
                            class="customer-product-picker-info"
                        >

                            <strong>
                                ${title}
                            </strong>

                            <span
                                class="customer-product-picker-price"
                            >
                                ${formatCurrency(price)}
                            </span>

                        </div>

                    </button>
                `;

            }
        ).join('');


    console.log(
        'BRICK C9-C — Product picker rendered:',
        availableProducts.length
    );
}


if (
    customerChatAttachProductBtn
) {

    customerChatAttachProductBtn.addEventListener(
        'click',
        openCustomerProductPicker
    );

}


if (
    customerProductPickerClose
) {

    customerProductPickerClose.addEventListener(
        'click',
        closeCustomerProductPicker
    );

}


if (
    customerProductPickerBackdrop
) {

    customerProductPickerBackdrop.addEventListener(
        'click',
        closeCustomerProductPicker
    );

}


if (
    customerProductPickerGrid
) {

    customerProductPickerGrid.addEventListener(
        'click',
        event => {

            const productCard =
                event.target.closest(
                    '.customer-product-picker-card'
                );

            if (!productCard) {
                return;
            }

            const productId =
                productCard.getAttribute(
                    'data-product-id'
                );

            const selectedProduct =
                publicProducts.find(
                    product =>
                        String(product.id) ===
                        String(productId)
                );

            if (!selectedProduct) {
                console.error(
                    'BRICK C9-C — Selected product not found:',
                    productId
                );

                return;
            }

            customerChatAttachedProduct =
    selectedProduct;


renderCustomerChatAttachment();


console.log(
    'BRICK C9-C — Product selected for attachment:',
    selectedProduct
);


console.log(
    'BRICK C9-D — Product attachment preview ready.'
);


closeCustomerProductPicker();

        }
    );

}


// =========================================
// CURRENT CUSTOMER CONVERSATION
// =========================================

let currentCustomerConversationId =
    null;

let currentCustomerBuyerId =
    null;


// =========================================
// ENSURE CUSTOMER IDENTITY
// =========================================
//
// Public store customers may not already
// have a Supabase session.
//
// We use an anonymous Supabase identity
// so sender_id can still be a UUID.
//
// IMPORTANT:
// Supabase Anonymous Sign-Ins must be
// enabled in the Supabase project.
// =========================================

async function ensureCustomerMessageUser() {

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    /*
     * If a Supabase user is already signed in,
     * only reuse that identity when it is NOT
     * the seller who owns this public store.
     */
    if (
        !userError &&
        user &&
        String(user.id) !==
            String(currentStoreOwnerId)
    ) {

        return user;

    }


    /*
     * The current session belongs to the seller
     * or there is no usable customer session.
     *
     * Create an anonymous customer identity.
     */
    const {
        data,
        error
    } =
        await supabaseClient.auth.signInAnonymously();


    if (error) {

        console.error(
            'BRICK H — Anonymous customer sign-in failed:',
            error
        );

        return null;

    }


    console.log(
        'BRICK H — Anonymous customer identity created:',
        data?.user?.id
    );


    return data?.user || null;

}


// =========================================
// FIND OR CREATE CONVERSATION
// =========================================

async function getCustomerConversation() {

    if (
        !currentStoreOwnerId
    ) {

        console.error(
            'BRICK H — Seller ID is missing.'
        );

        return null;

    }


    const buyer =
        await ensureCustomerMessageUser();


    if (!buyer) {

        return null;

    }


    currentCustomerBuyerId =
        buyer.id;

  const {
    data: { user: sessionUser },
    error: sessionError
} = await supabaseClient.auth.getUser();

console.log('BRICK H — Session verification:', {
    buyerId: buyer.id,
    sessionUserId: sessionUser?.id || null,
    sessionError: sessionError?.message || null,
    idsMatch: sessionUser?.id === buyer.id
});


    // =====================================
    // FIND EXISTING CONVERSATION
    // =====================================

    const {
        data: existingConversation,
        error: findError
    } =
        await supabaseClient
            .from('conversations')
            .select(`
                id,
                buyer_id,
                seller_id,
                created_at,
                updated_at
            `)
            .eq(
                'buyer_id',
                buyer.id
            )
            .eq(
                'seller_id',
                currentStoreOwnerId
            )
            .limit(1)
            .maybeSingle();


    if (findError) {

        console.error(
            'BRICK H — Conversation lookup failed:',
            findError
        );

        return null;

    }


    if (existingConversation) {

        currentCustomerConversationId =
            existingConversation.id;


        console.log(
            'BRICK H — Existing conversation found:',
            existingConversation.id
        );


        return existingConversation;

    }


    // =====================================
    // CREATE NEW CONVERSATION
    // =====================================

    const {
        data: newConversation,
        error: createError
    } =
        await supabaseClient
            .from('conversations')
            .insert({
                buyer_id:
                    buyer.id,

                seller_id:
                    currentStoreOwnerId
            })
            .select(`
                id,
                buyer_id,
                seller_id,
                created_at,
                updated_at
            `)
            .single();


    if (createError) {

        console.error(
            'BRICK H — Conversation creation failed:',
            createError
        );

        return null;

    }


    currentCustomerConversationId =
        newConversation.id;


    console.log(
        'BRICK H — New conversation created:',
        newConversation
    );


    return newConversation;

}


// =========================================
// LOAD CUSTOMER MESSAGE HISTORY
// =========================================

async function loadCustomerMessages() {

    if (
        !customerChatMessages
    ) {

        return;

    }


    const conversation =
        await getCustomerConversation();


    if (!conversation) {

        return;

    }


    const {
        data: messages,
        error
    } =
        await supabaseClient
            .from('messages')
            .select(`
                id,
                conversation_id,
                sender_id,
                receiver_id,
                message,
                read,
                created_at
            `)
            .eq(
                'conversation_id',
                conversation.id
            )
            .order(
                'created_at',
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            'BRICK H — Customer messages load failed:',
            error
        );

        return;

    }


    customerChatMessages.innerHTML =
        '';


    if (
        !messages ||
        messages.length === 0
    ) {

        const start =
            document.createElement(
                'div'
            );

        start.className =
            'customer-chat-start';

        start.id =
            'customerChatStart';


        start.innerHTML = `
            <div class="customer-chat-start-icon">
                <i class="fa-regular fa-comments"></i>
            </div>

            <strong>
                Start a conversation
            </strong>

            <span>
                Ask the seller about products,
                delivery, availability or anything
                else you need help with.
            </span>
        `;


        customerChatMessages.appendChild(
            start
        );


        return;

    }


    messages.forEach(
        messageRecord => {

            const isCustomer =
                String(
                    messageRecord.sender_id
                ) ===
                String(
                    currentCustomerBuyerId
                );


            const row =
                document.createElement(
                    'div'
                );


            row.className =
                isCustomer
                    ? 'customer-chat-message customer-message'
                    : 'customer-chat-message seller-message';


            const content =
                document.createElement(
                    'div'
                );

            content.className =
                'customer-message-content';


            const bubble =
                document.createElement(
                    'div'
                );

            bubble.className =
                'customer-message-bubble';

            
const rawMessage = String(messageRecord.message || '');

const attachmentStart = '[NEXODRA_PRODUCT_ATTACHMENT]';
const attachmentEnd = '[/NEXODRA_PRODUCT_ATTACHMENT]';

const startIndex = rawMessage.indexOf(attachmentStart);
const endIndex = startIndex === -1
    ? -1
    : rawMessage.indexOf(
        attachmentEnd,
        startIndex + attachmentStart.length
    );

let visibleMessage = rawMessage;

if (startIndex !== -1 && endIndex !== -1) {
    const jsonStart = startIndex + attachmentStart.length;
    const jsonText = rawMessage.slice(jsonStart, endIndex);

    try {
        const product = JSON.parse(jsonText);

        const card = document.createElement('div');
        card.className = 'customer-chat-product-message-card';

        const imageBox = document.createElement('div');
        imageBox.className = 'customer-chat-product-message-image';

        
if (
    typeof product.image === 'string' &&
    /^(https?:\/\/|data:image\/)/i.test(product.image)
) {

            const img = document.createElement('img');
            img.src = product.image;
            img.alt = product.title || 'Attached product';
            img.loading = 'lazy';

            img.onerror = () => {
                img.remove();
                imageBox.textContent = product.emoji || '📦';
            };

            imageBox.appendChild(img);
        } else {
            imageBox.textContent = product.emoji || '📦';
        }

        const details = document.createElement('div');
        details.className = 'customer-chat-product-message-details';

        const label = document.createElement('span');
        label.className = 'customer-chat-product-message-label';
        label.textContent = 'SHARED PRODUCT';

        const title = document.createElement('strong');
        title.className = 'customer-chat-product-message-title';
        title.textContent = product.title || 'Untitled Product';

        const price = document.createElement('span');
        price.className = 'customer-chat-product-message-price';

        const numericPrice = Number(product.price);
        price.textContent = Number.isFinite(numericPrice)
            ? formatCurrency(numericPrice)
            : '';

        details.append(label, title, price);
        card.append(imageBox, details);
        bubble.appendChild(card);

        visibleMessage = (
            rawMessage.slice(0, startIndex) +
            rawMessage.slice(endIndex + attachmentEnd.length)
        ).trim();
    } catch (error) {
        console.warn(
            'C9-F — Could not parse product attachment:',
            error
        );
    }
}

if (visibleMessage) {
    const text = document.createElement('div');
    text.className = 'customer-chat-product-message-text';
    text.textContent = visibleMessage;
    bubble.appendChild(text);
} else if (!bubble.hasChildNodes()) {
    bubble.textContent = rawMessage;
}



            const time =
                document.createElement(
                    'span'
                );

            time.className =
                'customer-message-time';

            time.textContent =
                messageRecord.created_at
                    ? new Date(
                        messageRecord.created_at
                    ).toLocaleTimeString(
                        [],
                        {
                            hour: '2-digit',
                            minute: '2-digit'
                        }
                    )
                    : '';


            content.appendChild(
                bubble
            );

            content.appendChild(
                time
            );

            row.appendChild(
                content
            );

            customerChatMessages.appendChild(
                row
            );

        }
    );


    // Mark seller messages as read.
    const unreadMessages =
        messages.filter(
            messageRecord =>
                String(
                    messageRecord.receiver_id
                ) ===
                String(
                    currentCustomerBuyerId
                ) &&
                messageRecord.read === false
        );


    for (
        const messageRecord
        of unreadMessages
    ) {

        const {
            error: readError
        } =
            await supabaseClient
                .from('messages')
                .update({
                    read: true
                })
                .eq(
                    'id',
                    messageRecord.id
                )
                .eq(
                    'receiver_id',
                    currentCustomerBuyerId
                );


        if (readError) {

            console.warn(
                'BRICK H — Customer could not mark message read:',
                readError
            );

        }

    }


    customerChatMessages.scrollTop =
        customerChatMessages.scrollHeight;


    console.log(
        'BRICK H — Customer message history loaded:',
        messages.length
    );

}


// =========================================
// C9-E — CUSTOMER SEND MESSAGE + PRODUCT
// =========================================

async function sendCustomerMessage() {

    if (
        !customerChatInput ||
        !customerChatSendBtn
    ) {

        return;

    }


    const message =
        customerChatInput.value.trim();


    /*
     * Allow sending either:
     *
     * 1. Normal text
     * 2. Product attachment + text
     */
    if (
        !message &&
        !customerChatAttachedProduct
    ) {

        return;

    }


    if (!currentStoreOwnerId) {

        console.error(
            'C9-E — Cannot send message without seller ID.'
        );

        return;

    }


    customerChatSendBtn.disabled =
        true;


    try {

        const conversation =
            await getCustomerConversation();


        if (!conversation) {

            alert(
                'The conversation could not be started.'
            );

            return;

        }


        const {
            data: buyer
        } =
            await supabaseClient.auth.getUser();


        if (!buyer?.user) {

            alert(
                'Customer identity could not be created.'
            );

            return;

        }


        const buyerId =
            buyer.user.id;


        /*
         * Build the message payload.
         *
         * The product attachment is stored
         * inside the existing messages.message
         * column so we do NOT need a new
         * database column for this brick.
         */
        let messageToSend =
            message;


        if (customerChatAttachedProduct) {

            const product =
                customerChatAttachedProduct;


          
console.log('BRICK C9-F — Attached product image check:', {
    productId: product.id || null,
    productTitle: product.title || null,
    imageValue: product.image || null,
    imageType: typeof product.image
});


            const attachmentData = {

                id:
                    product.id || null,

                title:
                    product.title ||
                    'Untitled Product',

                price:
                    Number(
                        product.price || 0
                    ),

                image:
                    product.image ||
                    '',

                emoji:
                    product.emoji ||
                    ''

            };


            const attachmentBlock =
                '[NEXODRA_PRODUCT_ATTACHMENT]' +
                JSON.stringify(
                    attachmentData
                ) +
                '[/NEXODRA_PRODUCT_ATTACHMENT]';


            messageToSend =
                attachmentBlock +
                (
                    message
                        ? '\n\n' + message
                        : ''
                );

        }


        console.log(
            'C9-E — Sending customer message:',
            {
                hasMessage:
                    Boolean(message),

                hasProduct:
                    Boolean(
                        customerChatAttachedProduct
                    ),

                product:
                    customerChatAttachedProduct
                        ? customerChatAttachedProduct.title
                        : null
            }
        );


        const {
            data: insertedMessage,
            error
        } =
            await supabaseClient
                .from('messages')
                .insert({

                    conversation_id:
                        conversation.id,

                    sender_id:
                        buyerId,

                    receiver_id:
                        currentStoreOwnerId,

                    message:
                        messageToSend,

                    read:
                        false

                })
                .select()
                .single();


        if (error) {

            console.error(
                'C9-E — Customer message insert failed:',
                error
            );

            alert(
                'Message could not be sent.\n\n' +
                error.message
            );

            return;

        }

// =========================================
// BRICK N2 — NOTIFY SELLER OF CHAT MESSAGE
// =========================================

try {

    const {
        data: {
            session
        },
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {

        console.error(
            'BRICK N2 — Customer session unavailable:',
            sessionError
        );

    } else {

        const notificationResponse =
            await fetch(
                `${NEXODRA_API_URL}/notifications/chat-message`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json',

                        'Authorization':
                            `Bearer ${session.access_token}`
                    },

                    body: JSON.stringify({
                        message_id: insertedMessage.id
                    })
                }
            );

        if (!notificationResponse.ok) {

            const notificationError =
                await notificationResponse.text();

            console.error(
                'BRICK N2 — Seller notification failed:',
                notificationError
            );

        } else {

            console.log(
                'BRICK N2 — Seller notification created.'
            );

        }

    }

} catch (notificationError) {

    console.error(
        'BRICK N2 — Notification request failed:',
        notificationError
    );

}

        /*
         * Update conversation activity.
         */
        const {
            error:
                conversationUpdateError
        } =
            await supabaseClient
                .from('conversations')
                .update({

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    'id',
                    conversation.id
                );


        if (
            conversationUpdateError
        ) {

            console.warn(
                'C9-E — Conversation timestamp update failed:',
                conversationUpdateError
            );

        }


        /*
         * Clear composer.
         */
        customerChatInput.value =
            '';


        /*
         * Clear attached product.
         */
        customerChatAttachedProduct =
            null;


        renderCustomerChatAttachment();


        /*
         * Reload the conversation so
         * the sent message appears immediately.
         */
        await loadCustomerMessages();


        console.log(
            'C9-E — Customer message sent successfully:',
            insertedMessage
        );


    } catch (error) {

        console.error(
            'C9-E — Unexpected send error:',
            error
        );

        alert(
            'Message could not be sent.'
        );


    } finally {

        customerChatSendBtn.disabled =
            false;

    }

}

// =========================================
// CUSTOMER SEND BUTTON
// =========================================

if (customerChatSendBtn) {

    customerChatSendBtn.addEventListener(
        'click',
        sendCustomerMessage
    );

}


// =========================================
// CUSTOMER ENTER TO SEND
// =========================================

if (customerChatInput) {

    customerChatInput.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Enter' &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendCustomerMessage();

            }

        }
    );

}


// =========================================
// LOAD CUSTOMER CHAT WHEN OPENED
// =========================================
//
// Existing C4-A already opens the
// public customer message screen.
//
// We add the database history load
// without replacing that navigation.
// =========================================

if (
    publicContactNav &&
    publicCustomerMessage
) {

    publicContactNav.addEventListener(
        'click',
        async () => {

            // Give the existing navigation
            // a moment to display the screen.
            await loadCustomerMessages();

        }
    );

}


console.log(
    'BRICK H — Persistent messaging system ready.'
);

// =========================================
// BRICK LIVE SELL 1 — LIVE SELL SCREEN
// =========================================

const liveSellScreen =
    document.getElementById(
        'liveSellScreen'
    );

const liveSellLaunch =
    document.getElementById(
        'liveSellLaunch'
    );

const liveSellModeButton =
    document.querySelector(
        '.sell-mode-btn[data-sell-mode="live"]'
    );

const liveSellBackBtn =
    document.getElementById(
        'liveSellBackBtn'
    );

const liveSellScanBtn =
    document.getElementById(
        'liveSellScanBtn'
    );

const liveEmptyScanBtn =
    document.getElementById(
        'liveEmptyScanBtn'
    );

const liveSellClearBtn =
    document.getElementById(
        'liveSellClearBtn'
    );

const liveSellItems =
    document.getElementById(
        'liveSellItems'
    );

const liveLastBarcode =
    document.getElementById(
        'liveLastBarcode'
    );

const liveSellItemCount =
    document.getElementById(
        'liveSellItemCount'
    );

const liveSellSubtotal =
    document.getElementById(
        'liveSellSubtotal'
    );

const liveSellTotal =
    document.getElementById(
        'liveSellTotal'
    );

const liveSellPayAmount =
    document.getElementById(
        'liveSellPayAmount'
    );

const liveSellCompleteBtn =
    document.getElementById(
        'liveSellCompleteBtn'
    );


// =========================================
// OPEN LIVE SELL
// =========================================

function openLiveSellScreen() {

    console.log(
        'BRICK LIVE SELL 1 — Opening Live Sell.'
    );

    if (!liveSellScreen) {

        console.error(
            'BRICK LIVE SELL 1 — Live Sell screen not found.'
        );

        return;
    }


    /*
     * Hide every normal screen.
     */

    screens.forEach(screen => {

        screen.classList.remove(
            'active'
        );

    });


    /*
     * Show Live Sell.
     */

    liveSellScreen.classList.add(
        'active'
    );


    /*
     * Keep Sell selected in bottom
     * navigation.
     */

    navButtons.forEach(button => {

        button.classList.remove(
            'active'
        );

        if (
            button.getAttribute(
                'data-target'
            ) === 'sellScreen'
        ) {

            button.classList.add(
                'active'
            );

        }

    });


    /*
     * Refresh Live Sell UI.
     */

    renderLiveSellItems();

    updateLiveSellTotals();

}


// =========================================
// BACK TO NORMAL SELL
// =========================================

if (liveSellBackBtn) {

    liveSellBackBtn.addEventListener(
        'click',
        () => {

            console.log(
                'BRICK LIVE SELL 1 — Returning to Sell.'
            );


            if (liveSellScreen) {

                liveSellScreen.classList.remove(
                    'active'
                );

            }


            const sellButton =
                document.querySelector(
                    '.nav-btn[data-target="sellScreen"]'
                );

            if (sellButton) {

                sellButton.click();

            }

        }
    );

}


// =========================================
// LIVE SELL LAUNCH BUTTON
// =========================================

if (liveSellLaunch) {

    liveSellLaunch.addEventListener(
        'click',
        () => {

            openLiveSellScreen();

        }
    );

}


// =========================================
// LIVE SELL MODE BUTTON
// =========================================

if (liveSellModeButton) {

    liveSellModeButton.addEventListener(
        'click',
        () => {

            openLiveSellScreen();

        }
    );

}


// =========================================
// LIVE SELL SCANNER
// =========================================

let liveSellScanner = null;

let liveSellScannerRunning =
    false;

let liveSellScannerClosing =
    false;

let liveSellBarcodeProcessing =
    false;


/*
 * =========================================
 * BRICK S3-B — SAME BARCODE PROTECTION
 * =========================================
 */

let liveSellLastDetectedBarcode =
    '';

let liveSellLastDetectedTime =
    0;

let liveSellBarcodeLocked =
    false;

let liveSellBarcodeReleaseTimer =
    null;


// =========================================
// CREATE LIVE SCANNER MODAL
// =========================================

function createLiveSellScannerModal() {

    let modal =
        document.getElementById(
            'liveSellScannerModal'
        );

    if (modal) {

        return modal;

    }


    modal =
        document.createElement(
            'div'
        );

    modal.id =
        'liveSellScannerModal';

    modal.className =
        'scanner-modal';

    modal.style.display =
        'none';


    modal.innerHTML = `

        <div class="scanner-overlay">

            <div class="scanner-header">

                <span>

                    <i class="fa-solid fa-barcode"></i>

                    Scan Product

                </span>

                <button
                    type="button"
                    id="liveSellScannerClose"
                    class="scanner-close-btn"
                >

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>


            <div class="scanner-viewport">

                <div id="liveSellScannerReader"></div>

                <div class="scanner-reticle">

                    <div class="laser-line"></div>

                    <span class="corner top-left"></span>

                    <span class="corner top-right"></span>

                    <span class="corner bottom-left"></span>

                    <span class="corner bottom-right"></span>

                </div>

            </div>


            <div class="scanner-footer">

                <p>
                    Center the product barcode inside the frame
                </p>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    return modal;

}


// =========================================
// OPEN LIVE SELL SCANNER
// =========================================

async function openLiveSellScanner() {

    console.log(
        'BRICK LIVE SELL 2 — Opening Live Sell scanner.'
    );


    const modal =
        createLiveSellScannerModal();


    const reader =
        document.getElementById(
            'liveSellScannerReader'
        );


    if (!reader) {

        console.error(
            'BRICK LIVE SELL 2 — Scanner reader not found.'
        );

        return;

    }


    if (
        typeof Html5Qrcode ===
        'undefined'
    ) {

        alert(
            'Barcode scanner is not available. Please refresh the page.'
        );

        return;

    }


    modal.style.display =
        'flex';


    if (liveSellScannerRunning) {

        return;

    }


    liveSellScannerClosing =
        false;


    try {

        liveSellScanner =
            new Html5Qrcode(
                'liveSellScannerReader'
            );


        await liveSellScanner.start(

            {
                facingMode:
                    'environment'
            },

            {
                fps: 10,

                qrbox: {
                    width: 280,
                    height: 160
                },

                aspectRatio:
                    1.777778
            },


          

            (
    decodedText,
    decodedResult
) => {

    const barcode =
        String(
            decodedText || ''
        ).trim();

    if (!barcode) {
        return;
    }

    /*
     * =========================================
     * BRICK S3-C2 — BARCODE RELEASE PROTECTION
     * =========================================
     *
     * The same physical barcode must leave the
     * camera view before it can be counted again.
     */

    if (
        liveSellBarcodeLocked &&
        barcode ===
            liveSellLastDetectedBarcode
    ) {

        /*
         * Same barcode is still visible.
         *
         * Keep extending the release timer.
         */

        if (
            liveSellBarcodeReleaseTimer
        ) {
            clearTimeout(
                liveSellBarcodeReleaseTimer
            );
        }

        liveSellBarcodeReleaseTimer =
            setTimeout(
                () => {

                    liveSellBarcodeLocked =
                        false;

                    liveSellLastDetectedBarcode =
                        '';

                    liveSellLastDetectedTime =
                        0;

                    liveSellBarcodeReleaseTimer =
                        null;

                },
                1500
            );

        return;
    }

    /*
     * Prevent overlapping barcode processing.
     */

    if (
        liveSellBarcodeProcessing
    ) {
        return;
    }

    /*
     * A new barcode has been accepted.
     */

    if (
        liveSellBarcodeReleaseTimer
    ) {
        clearTimeout(
            liveSellBarcodeReleaseTimer
        );

        liveSellBarcodeReleaseTimer =
            null;
    }

    liveSellBarcodeLocked =
        true;

    liveSellLastDetectedBarcode =
        barcode;

    liveSellLastDetectedTime =
        Date.now();

    /*
     * Start release detection.
     */

    liveSellBarcodeReleaseTimer =
        setTimeout(
            () => {

                liveSellBarcodeLocked =
                    false;

                liveSellLastDetectedBarcode =
                    '';

                liveSellLastDetectedTime =
                    0;

                liveSellBarcodeReleaseTimer =
                    null;

            },
            1500
        );

    /*
     * Process the accepted barcode.
     */

    handleLiveSellBarcode(
        barcode,
        decodedResult
    );

},


            () => {

                /*
                 * Continuous scan errors
                 * are intentionally ignored.
                 */

            }

        );


        liveSellScannerRunning =
            true;


        console.log(
            'BRICK LIVE SELL 2 — Scanner started.'
        );


    } catch (error) {

        console.error(
            'BRICK LIVE SELL 2 — Scanner failed:',
            error
        );


        liveSellScanner =
            null;

        liveSellScannerRunning =
            false;

        modal.style.display =
            'none';


        alert(
            'Unable to access the camera. Please allow camera permission and try again.'
        );

    }

}


// =========================================
// CLOSE LIVE SELL SCANNER
// =========================================

async function closeLiveSellScanner() {

    if (
        liveSellScannerClosing
    ) {

        return;

    }


    liveSellScannerClosing =
        true;


    if (
        liveSellScanner &&
        liveSellScannerRunning
    ) {

        try {

            await liveSellScanner.stop();

        } catch (error) {

            console.warn(
                'BRICK LIVE SELL 2 — Scanner stop warning:',
                error
            );

        }

    }


    liveSellScanner =
        null;

    liveSellScannerRunning =
        false;

  /*
 * =========================================
 * BRICK 4 — RESET S3-C2 BARCODE STATE
 * =========================================
 */

if (liveSellBarcodeReleaseTimer) {
    clearTimeout(
        liveSellBarcodeReleaseTimer
    );

    liveSellBarcodeReleaseTimer =
        null;
}

liveSellBarcodeLocked =
    false;

liveSellLastDetectedBarcode =
    '';

liveSellLastDetectedTime =
    0;


    const reader =
        document.getElementById(
            'liveSellScannerReader'
        );

    if (reader) {

        reader.innerHTML =
            '';

    }


    const modal =
        document.getElementById(
            'liveSellScannerModal'
        );

    if (modal) {

        modal.style.display =
            'none';

    }


    liveSellScannerClosing =
        false;

}


// =========================================
// SCANNER BUTTONS
// =========================================

if (liveSellScanBtn) {

    liveSellScanBtn.addEventListener(
        'click',
        openLiveSellScanner
    );

}


if (liveEmptyScanBtn) {

    liveEmptyScanBtn.addEventListener(
        'click',
        openLiveSellScanner
    );

}


// =========================================
// SCANNER CLOSE BUTTON
// =========================================

document.addEventListener(
    'click',
    event => {

        const closeButton =
            event.target.closest(
                '#liveSellScannerClose'
            );

        if (!closeButton) {

            return;

        }


        closeLiveSellScanner();

    }
);


// =========================================
// BARCODE PROCESSING
// =========================================

async function handleLiveSellBarcode(
    decodedText,
    decodedResult
) {

    if (
    !decodedText ||
    liveSellScannerClosing ||
    liveSellBarcodeProcessing
) {

    return;
}

liveSellBarcodeProcessing =
    true;



    const barcode =
        String(
            decodedText
        ).trim();


    console.log(
        'BRICK LIVE SELL 3 — Barcode scanned:',
        barcode
    );


    /*
     * Display last scanned barcode.
     */

    if (liveLastBarcode) {

        liveLastBarcode.textContent =
            barcode;

    }


    /* =========================================
   BRICK — LIVE SELL BARCODE LOOKUP FIX

   1. Try the existing local POS list first.
   2. If not found, verify directly against
      Supabase.
   3. Sync the found product back into the
      existing sellProducts array.

   This keeps the existing NEXODRA POS flow
   untouched while fixing stale local data.
   ========================================= */


/*
 * Normalize barcode using the
 * S2 barcode-cache normalizer.
 */

const scannedBarcode =
    normalizeOdropBarcode(
        barcode
    );


/*
 * =========================================
 * BRICK S2-B — BARCODE CACHE FIRST
 * =========================================
 *
 * First search the lightweight local
 * barcode cache.
 */

let product =
    getOdropCachedProductByBarcode(
        scannedBarcode
    );


if (product) {

    console.log(
        'BRICK S2-B — Product found in barcode cache:',
        product
    );

}


/*
 * If the barcode cache does not contain
 * the product, try the existing local
 * POS product list.
 */

if (!product) {

    product =
        sellProducts.find(
            item =>
                normalizeOdropBarcode(
                    item.barcode
                ) === scannedBarcode
        );


    if (product) {

        console.log(
            'BRICK S2-B — Product found in local POS products:',
            product
        );

    }

}


/*
 * FALLBACK:
 *
 * If the product is not currently in the
 * local sellProducts array, check Supabase.
 */

if (!product) {

    console.log(
        'BRICK LIVE SELL BARCODE — Not found locally. Checking Supabase:',
        scannedBarcode
    );


    try {

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabaseClient.auth.getUser();


        if (userError || !user) {

            console.error(
                'BRICK LIVE SELL BARCODE — Could not get current user:',
                userError
            );

        } else {

            const {
                data: databaseProducts,
                error: databaseError
            } =
                await supabaseClient
                    .from('products')
                    .select(`
                            id,
                            title,
                            category,
                            price,
                            stock,
                            emoji,
                            image,
                            barcode,
                            description,
                            published,
                            variants,
                            owner_id
                    `)
                    .eq(
                        'owner_id',
                        user.id
                    );


            if (databaseError) {

                console.error(
                    'BRICK LIVE SELL BARCODE — Supabase lookup failed:',
                    databaseError
                );

            } else {

                product =
                    (databaseProducts || []).find(
                        item =>
                            normalizeOdropBarcode(
                                item.barcode
                            ) === scannedBarcode
                    );


                /*
                 * Keep the existing local POS
                 * data synchronized if found.
                 */

                if (product) {

                    const existingLocalProduct =
                        sellProducts.find(
                            item =>
                                String(item.id) ===
                                String(product.id)
                        );


                    if (!existingLocalProduct) {

                        sellProducts.push(
                            {
                                ...product
                            }
                        );

                    }

                 syncOdropBarcodeCache(
                 sellProducts,
                 user.id
               ); 


                    console.log(
                        'BRICK LIVE SELL BARCODE — Product found in Supabase:',
                        product
                    );

                }

            }

        }

    } catch (error) {

        console.error(
            'BRICK LIVE SELL BARCODE — Unexpected lookup error:',
            error
        );

    }

}


/*
 * Product genuinely does not exist.
 */

if (!product) {

    console.warn(
        'BRICK LIVE SELL BARCODE — Product not found:',
        scannedBarcode
    );


    await closeLiveSellScanner();


    alert(
        'No product was found with barcode:\n\n' +
        barcode
    );

  liveSellBarcodeProcessing = false;

    return;

}


    /*
     * Check stock.
     */

    const stock =
        Number(
            product.stock || 0
        );


    if (stock <= 0) {

        await closeLiveSellScanner();


        alert(
            product.title +
            ' is currently out of stock.'
        );

      liveSellBarcodeProcessing = false;

        return;

    }


    /*
     * Add to existing sale.
     */

    const existingItem =
        currentSaleItems.find(
            item =>
                String(
                    item.productId
                ) ===
                String(
                    product.id
                )
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        currentSaleItems.push({

            productId:
                product.id,

            title:
                product.title || '',

            price:
                Number(
                    product.price || 0
                ),

            image:
                product.image || '',

            emoji:
                product.emoji || '📦',

            quantity:
                1

        });

    }


    /*
     * Reduce local available stock
     * exactly like the existing POS
     * selling flow.
     */

    product.stock =
        stock - 1;


    /*
     * Refresh existing POS state.
     */

    renderSellProducts();

    renderSellCart();

    updateSellTotals();


    /*
     * Refresh Live Sell UI.
     */

    renderLiveSellItems();

    updateLiveSellTotals();


    console.log(
    'BRICK LIVE SELL 3 — Product added:',
    product.title
);

/*
 * =========================================
 * BRICK S3-C1 — SCANNER STATUS FEEDBACK
 * =========================================
 */

const scannerStatus =
    document.querySelector(
        '#liveSellScannerModal .scanner-footer p'
    );

if (scannerStatus) {

    scannerStatus.textContent =
        '✓ ' +
        (product.title || 'Product') +
        ' found — 1 unit added';

}
  

/*
 * =========================================
 * BRICK S3-A — RELEASE BARCODE PROCESSING
 * =========================================
 *
 * Allow the next barcode detected by the
 * continuously running scanner to be processed.
 */

liveSellBarcodeProcessing =
    false;


/*
 * Scanner intentionally remains open.
 */

}


// =========================================
// RENDER LIVE SALE ITEMS
// =========================================

function renderLiveSellItems() {

    if (!liveSellItems) {

        return;

    }


    if (
        !currentSaleItems ||
        currentSaleItems.length === 0
    ) {

        liveSellItems.innerHTML = `

            <div class="live-empty-sale">

                <div class="live-empty-icon">

                    <i class="fa-solid fa-cart-shopping"></i>

                </div>

                <strong>
                    No products scanned
                </strong>

                <p>
                    Scan a barcode to add a product to this sale.
                </p>

                <button
                    type="button"
                    id="liveEmptyScanBtn"
                    class="live-empty-scan-btn"
                >

                    <i class="fa-solid fa-barcode"></i>

                    Start scanning

                </button>

            </div>

        `;


        /*
         * Re-bind because the empty state
         * was regenerated.
         */

        const newScanButton =
            document.getElementById(
                'liveEmptyScanBtn'
            );


        if (newScanButton) {

            newScanButton.addEventListener(
                'click',
                openLiveSellScanner
            );

        }


        return;

    }


    liveSellItems.innerHTML =
        currentSaleItems.map(
            item => {

                const quantity =
                    Number(
                        item.quantity || 0
                    );


                const price =
                    Number(
                        item.price || 0
                    );


                const total =
                    quantity * price;


                return `

                    <div
                        class="live-sale-item"
                        data-product-id="${item.productId}"
                    >

                        <div class="live-sale-item-image">

                            ${
                                item.image

                                ? `

                                    <img
                                        src="${item.image}"
                                        alt="${item.title || 'Product'}"
                                    >

                                `

                                : `

                                    <span>
                                        ${item.emoji || '📦'}
                                    </span>

                                `
                            }

                        </div>


                        <div class="live-sale-item-info">

                            <strong>
                                ${item.title || 'Product'}
                            </strong>

                            <span>
    ${formatCurrency(price)}
    ·
    Qty ${quantity}
</span>

                        </div>


                        <div class="live-sale-item-total">

                            <strong>
    ${formatCurrency(total)}
</strong>

                            <span>
                                ${quantity} item${quantity === 1 ? '' : 's'}
                            </span>

                        </div>


                        <button
                            type="button"
                            class="live-remove-item-btn"
                            data-product-id="${item.productId}"
                            aria-label="Remove product"
                        >

                            <i class="fa-solid fa-xmark"></i>

                        </button>

                    </div>

                `;

            }
        ).join('');

}


// =========================================
// LIVE SALE REMOVE ITEM
// =========================================

if (liveSellItems) {

    liveSellItems.addEventListener(
        'click',
        event => {

            const removeButton =
                event.target.closest(
                    '.live-remove-item-btn'
                );


            if (!removeButton) {

                return;

            }


            const productId =
                removeButton.getAttribute(
                    'data-product-id'
                );


            const itemIndex =
                currentSaleItems.findIndex(
                    item =>
                        String(
                            item.productId
                        ) ===
                        String(
                            productId
                        )
                );


            if (itemIndex === -1) {

                return;

            }


            const item =
                currentSaleItems[
                    itemIndex
                ];


            /*
             * Return the quantity to stock.
             */

            const product =
                sellProducts.find(
                    product =>
                        String(
                            product.id
                        ) ===
                        String(
                            productId
                        )
                );


            if (product) {

                product.stock =
                    Number(
                        product.stock || 0
                    ) +
                    Number(
                        item.quantity || 0
                    );

            }


            currentSaleItems.splice(
                itemIndex,
                1
            );


            renderSellProducts();

            renderSellCart();

            updateSellTotals();

            renderLiveSellItems();

            updateLiveSellTotals();

        }
    );

}


// =========================================
// CLEAR LIVE SALE
// =========================================

if (liveSellClearBtn) {

    liveSellClearBtn.addEventListener(
        'click',
        () => {

            if (
                !currentSaleItems ||
                currentSaleItems.length === 0
            ) {

                return;

            }


            const confirmed =
                confirm(
                    'Clear all products from the current sale?'
                );


            if (!confirmed) {

                return;

            }


            /*
             * Return scanned quantities
             * to inventory.
             */

            currentSaleItems.forEach(
                item => {

                    const product =
                        sellProducts.find(
                            product =>
                                String(
                                    product.id
                                ) ===
                                String(
                                    item.productId
                                )
                        );


                    if (product) {

                        product.stock =
                            Number(
                                product.stock || 0
                            ) +
                            Number(
                                item.quantity || 0
                            );

                    }

                }
            );


            currentSaleItems =
                [];


            sellDiscountAmount =
                0;

            sellTaxAmount =
                0;


            renderSellProducts();

            renderSellCart();

            updateSellTotals();

            renderLiveSellItems();

            updateLiveSellTotals();


            if (liveLastBarcode) {

                liveLastBarcode.textContent =
                    'No product scanned yet';

            }

        }
    );

}


// =========================================
// LIVE TOTALS
// =========================================

function updateLiveSellTotals() {

    const items =
        currentSaleItems.reduce(
            (
                total,
                item
            ) => {

                return total +
                    Number(
                        item.quantity || 0
                    );

            },
            0
        );


    const subtotal =
        currentSaleItems.reduce(
            (
                total,
                item
            ) => {

                return total +
                    (
                        Number(
                            item.price || 0
                        ) *
                        Number(
                            item.quantity || 0
                        )
                    );

            },
            0
        );


    if (liveSellItemCount) {

        liveSellItemCount.textContent =
            items;

    }


    if (liveSellSubtotal) {

        liveSellSubtotal.textContent =
    formatCurrency(subtotal);

    }


    if (liveSellTotal) {

        liveSellTotal.textContent =
    formatCurrency(subtotal);

    }


    if (liveSellPayAmount) {

        liveSellPayAmount.textContent =
    formatCurrency(subtotal);

    }

}


// =========================================
// INITIAL LIVE SELL RENDER
// =========================================

renderLiveSellItems();

updateLiveSellTotals();


// =========================================
// COMPLETE SALE
// =========================================

if (liveSellCompleteBtn) {

    liveSellCompleteBtn.addEventListener(
        'click',
        () => {

            /*
             * Reuse the existing POS
             * Pay button.
             */

            if (
                !currentSaleItems ||
                currentSaleItems.length === 0
            ) {

                alert(
                    'Please scan at least one product first.'
                );

                return;

            }


            if (sellPayBtn) {

                sellPayBtn.click();

            } else {

                console.error(
                    'BRICK LIVE SELL 4 — Existing POS Pay button not found.'
                );

            }

        }
    );

}

// =========================================
// C10-D — NEXODRA PYTHON API CONNECTION
// =========================================

async function nexodraApiHealthCheck() {

    try {

        const response =
            await fetch(
                `${NEXODRA_API_URL}/health`
            );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log(
            'C10-D — Nexodra Python API connected:',
            data
        );

        return data;

    } catch (error) {

        console.error(
            'C10-D — Nexodra Python API connection failed:',
            error
        );

        return null;
    }
}

nexodraApiHealthCheck();


// =========================================


/* =========================================
   BRICK 2 — STORE SALES PERIOD SELECTOR
   UI ONLY — NO SALES CALCULATION CHANGES
========================================= */

(function initOverviewPeriodSelector() {

    const wrap = document.getElementById(
        'overviewPeriodWrap'
    );

    const trigger = document.getElementById(
        'overviewPeriodBtn'
    );

    const menu = document.getElementById(
        'overviewPeriodMenu'
    );

    if (!wrap || !trigger || !menu) {
        console.warn(
            'BRICK 2 — Period selector elements not found.'
        );
        return;
    }

    function closeMenu() {
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', function () {
        const willOpen = menu.hidden;

        menu.hidden = !willOpen;

        trigger.setAttribute(
            'aria-expanded',
            String(willOpen)
        );
    });

    menu.addEventListener('click', function (event) {
        const option = event.target.closest(
            'button[data-period]'
        );

        if (!option) return;

        const label = option.textContent.trim();

        // Keep the selected period available for later bricks.
        window.nexodraSelectedSalesPeriod =
            option.dataset.period;

        trigger.innerHTML =
            `${label} <i class="fa-solid fa-chevron-down"></i>`;

        menu.querySelectorAll(
            'button[data-period]'
        ).forEach(function (button) {
            button.classList.toggle(
                'selected',
                button === option
            );
        });

closeMenu();

console.log(
    'BRICK 5A — Refreshing Store Overview for period:',
    window.nexodraSelectedSalesPeriod
);

if (typeof updateStoreSalesCard === 'function') {
    updateStoreSalesCard();
}

if (typeof updateStoreCardSalesGraph === 'function') {
    updateStoreCardSalesGraph();
}

    });

    document.addEventListener('click', function (event) {
        if (!wrap.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();
            trigger.focus();
        }
    });

    console.log(
        'BRICK 2 — Period selector initialized.'
    );

})();

// =========================================
// NEXODRA — HELP & SUPPORT NAVIGATION
// BRICK HS-B
// =========================================

const openHelpSupportBtn =
    document.getElementById('openHelpSupportBtn');

const helpSupportScreen =
    document.getElementById('helpSupportScreen');

const backFromHelpSupportBtn =
    document.getElementById('backFromHelpSupportBtn');

if (openHelpSupportBtn && helpSupportScreen) {

    openHelpSupportBtn.addEventListener('click', () => {

        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        helpSupportScreen.classList.add('active');

// Reset the actual scrollable app container
const appBody = document.querySelector('.app-body');

if (appBody) {
    appBody.scrollTop = 0;
}
      
// Reset Help & Support content to the top
helpSupportScreen.scrollTop = 0;

const helpPageContent =
    helpSupportScreen.querySelector('.orders-page');

if (helpPageContent) {
    helpPageContent.scrollTop = 0;
}

window.scrollTo(0, 0);
      
        if (typeof screenTitle !== 'undefined' && screenTitle) {
            screenTitle.textContent = 'Help & Support';
        }

    });

}

if (backFromHelpSupportBtn) {

    backFromHelpSupportBtn.addEventListener('click', () => {

        helpSupportScreen?.classList.remove('active');

        const dashboardScreen =
            document.querySelector('.screen');

        if (dashboardScreen) {
            dashboardScreen.classList.add('active');
        }

        if (typeof screenTitle !== 'undefined' && screenTitle) {
            screenTitle.textContent = 'Dashboard';
        }

    });

}


/* =========================================
   NEXODRA — PAYMENTS & PAYOUTS NAVIGATION
   BRICK PP-3
========================================= */

(() => {
    const paymentsBtn = document.getElementById(
        'openPaymentsPayoutsBtn'
    );

    const paymentsScreen = document.getElementById(
        'paymentsPayoutsScreen'
    );

    if (!paymentsBtn || !paymentsScreen) {
        console.warn(
            'Payments & Payouts: menu button or screen not found.'
        );
        return;
    }

    paymentsBtn.addEventListener('click', () => {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        paymentsScreen.classList.add('active');

        const appBody = document.querySelector('.app-body');

        if (appBody) {
            appBody.scrollTop = 0;
        }

        paymentsScreen.scrollTop = 0;

        const headerTitle = document.querySelector(
            '.app-header h1, .app-header h2, ' +
            'header h1, header h2'
        );

        if (headerTitle) {
            headerTitle.textContent = 'Payments & Payouts';
        }
    });
})();

/* =========================================
   NEXODRA — DELIVERY & SHIPPING NAVIGATION
   BRICK DS-3
========================================= */

(() => {
    const deliveryButton = document.getElementById(
        'openDeliveryShippingBtn'
    );

    const deliveryScreen = document.getElementById(
        'deliveryShippingScreen'
    );

    if (!deliveryButton || !deliveryScreen) {
        console.warn(
            'Delivery & Shipping: button or screen not found.'
        );
        return;
    }

    deliveryButton.addEventListener('click', () => {
        // Hide the other screens using the app's
        // existing screen convention.
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Display Delivery & Shipping.
        deliveryScreen.classList.add('active');

        // Reset the screen's own scroll position.
        deliveryScreen.scrollTop = 0;

        const page = deliveryScreen.querySelector(
            '.delivery-page'
        );

        if (page) {
            page.scrollTop = 0;
        }
    });
})();

// N-3: Open the Notifications screen
(() => {
  const openNotificationsBtn =
    document.getElementById("openNotificationPreferencesBtn");

  const notificationsScreen =
    document.getElementById("notificationPreferencesScreen");

  if (!openNotificationsBtn || !notificationsScreen) {
    console.warn(
      "Notifications navigation: menu button or screen not found."
    );
    return;
  }

  function openNotificationsScreen() {
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("active");
    });

    notificationsScreen.classList.add("active");
    notificationsScreen.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  openNotificationsBtn.addEventListener(
    "click",
    openNotificationsScreen
  );

  openNotificationsBtn.addEventListener("keydown", (event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openNotificationsScreen();
    }
  });
})();

// TEMP SN-4 — TRACK DASHBOARD STORE NAME
setTimeout(() => {
    const heading =
        document.getElementById('storeDisplayName');

    console.log(
        'SN-4: Dashboard name after 3 seconds:',
        heading?.textContent
    );
}, 3000);

setTimeout(() => {
    const heading =
        document.getElementById('storeDisplayName');

    console.log(
        'SN-4: Dashboard name after 8 seconds:',
        heading?.textContent
    );
}, 8000);





/* =========================================================
   6. CHART SYSTEM
   Uses Chart.js when available.
   Includes a native Canvas fallback.
   ========================================================= */

const chartInstances = new Map();

const chartPalette = {
  purple: "#8b5cf6",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  green: "#10b981",
  orange: "#f59e0b",
  pink: "#ec4899",
  red: "#ef4444",
  grid: "rgba(148, 163, 184, 0.14)",
  text: "#94a3b8"
};

function getChartTheme() {
  const dark =
    document.documentElement.dataset.theme === "dark" ||
    document.body.classList.contains("dark-mode");

  return {
    text: dark ? "#cbd5e1" : "#64748b",
    grid: dark
      ? "rgba(148,163,184,0.13)"
      : "rgba(100,116,139,0.12)"
  };
}

function makeGradient(context, color) {
  const gradient = context.createLinearGradient(
    0,
    0,
    0,
    320
  );

  gradient.addColorStop(0, `${color}55`);
  gradient.addColorStop(1, `${color}00`);

  return gradient;
}

function initializeCharts() {
  // Chart.js canvases.
  document.querySelectorAll("canvas[data-chart]").forEach((canvas) => {
    const type = canvas.dataset.chart;

    const labels = (
      canvas.dataset.labels ||
      "Mon,Tue,Wed,Thu,Fri,Sat,Sun"
    ).split(",");

    const values = (
      canvas.dataset.values ||
      "18,28,23,39,32,48,42"
    )
      .split(",")
      .map(Number);

    const color =
      canvas.dataset.color ||
      chartPalette.purple;

    createChart(canvas, {
      type,
      labels,
      values,
      color
    });
  });
    // Automatically initialize common chart IDs.
  const defaultCharts = [
    {
      selectors: ["#revenueChart", "#mainChart"],
      type: "line",
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [24, 38, 31, 52, 43, 67, 58],
      color: chartPalette.purple
    },
    {
      selectors: ["#activityChart"],
      type: "bar",
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      values: [35, 52, 43, 68, 57, 82],
      color: chartPalette.blue
    },
    {
      selectors: ["#trafficChart"],
      type: "doughnut",
      labels: ["Direct", "Social", "Search", "Referral"],
      values: [35, 25, 28, 12],
      color: chartPalette.purple
    }
  ];

  defaultCharts.forEach((config) => {
    for (const selector of config.selectors) {
      const canvas = document.querySelector(selector);

      console.log(
  'CHART DEBUG — Canvas lookup:',
  selector,
  canvas
);

      if (!canvas || chartInstances.has(canvas)) continue;

      createChart(canvas, config);
      break;
    }
  });
}

/* =========================================================
   BRICK 1 — PREPARE REAL REVENUE CHART DATA
   Uses sales already loaded from Supabase.
   ========================================================= */

function prepareRevenueChartData(sales, range = '30d') {

  const now = new Date();

  let days = 30;

  if (range === '7d') {
    days = 7;
  } else if (range === '90d') {
    days = 90;
  } else if (range === '1y') {
    days = 365;
  }

  const labels = [];
  const values = [];

  const startDate = new Date(now);

  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (days - 1));

  for (let i = 0; i < days; i++) {

    const date = new Date(startDate);

    date.setDate(startDate.getDate() + i);

    labels.push(
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit'
      })
    );

    values.push(0);

  }

  (sales || []).forEach((sale) => {

    if (!sale.created_at) return;

    const saleDate = new Date(sale.created_at);

    if (Number.isNaN(saleDate.getTime())) return;

    saleDate.setHours(0, 0, 0, 0);

    const dayDifference = Math.floor(
      (saleDate.getTime() - startDate.getTime()) /
      (1000 * 60 * 60 * 24)
    );

    if (
      dayDifference >= 0 &&
      dayDifference < days
    ) {

      values[dayDifference] += Number(
        sale.total || 0
      );

    }

  });

  return {
    labels,
    values
  };

}

function createChart(canvas, config) {
  if (!canvas || chartInstances.has(canvas)) return;

  if (typeof Chart !== "undefined") {
    createChartJS(canvas, config);
  } else {
    drawNativeChart(canvas, config);
  }
}

/* =========================================================
   BRICK 3 — UPDATE REVENUE CHART
   Uses the existing Chart.js / Canvas chart system.
   ========================================================= */

function updateRevenueChart(canvas, chartData) {

  if (!canvas || !chartData) {
    console.warn(
      'BRICK 3 — Missing Revenue canvas or chart data.'
    );

    return;
  }

  const config = {
    type: 'line',
    labels: chartData.labels,
    values: chartData.values,
    color: chartPalette.purple,
    label: 'Revenue'
  };

  const existingChart = chartInstances.get(canvas);

  if (
    existingChart &&
    typeof existingChart.update === 'function'
  ) {

    existingChart.data.labels = config.labels;

    existingChart.data.datasets[0].data =
      config.values;

    existingChart.update();

    console.log(
      'BRICK 3 — Existing Revenue chart updated.'
    );

    return;
  }

  if (existingChart) {
    chartInstances.delete(canvas);
  }

  createChart(canvas, config);

  console.log(
    'BRICK 3 — Revenue chart created.'
  );

}

function createChartJS(canvas, config) {
  const context = canvas.getContext("2d");

  const theme = getChartTheme();

  const isDoughnut = config.type === "doughnut";
  const isBar = config.type === "bar";

  const dataset = {
    label: config.label || "Performance",
    data: config.values,
    borderColor: config.color,
    backgroundColor: isDoughnut
      ? [
          chartPalette.purple,
          chartPalette.blue,
          chartPalette.cyan,
          chartPalette.green
        ]
      : isBar
        ? `${config.color}cc`
        : makeGradient(context, config.color),
    borderWidth: isDoughnut ? 0 : 2.5,
    borderRadius: isBar ? 8 : 0,
    fill: !isBar && !isDoughnut,
    tension: 0.4,
    pointRadius: isDoughnut ? 0 : 3,
    pointHoverRadius: 6,
    pointBackgroundColor: config.color,
    pointBorderColor: "#ffffff",
    pointBorderWidth: 2
  };
const chart = new Chart(context, {
    type: config.type,
    data: {
      labels: config.labels,
      datasets: [dataset]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: prefersReducedMotion ? 0 : 1200,
        easing: "easeOutQuart"
      },
      interaction: {
        intersect: false,
        mode: "index"
      },
      plugins: {
        legend: {
          display: isDoughnut,
          position: "bottom",
          labels: {
            color: theme.text,
            usePointStyle: true,
            pointStyle: "circle",
            padding: 18
          }
        },
        tooltip: {
          backgroundColor: "#111827",
          titleColor: "#ffffff",
          bodyColor: "#e5e7eb",
          padding: 12,
          cornerRadius: 10,
          displayColors: true
        }
      },
      scales: isDoughnut
        ? {}
        : {
            x: {
              grid: {
                display: false
              },
              border: {
                display: false
              },
              ticks: {
                color: theme.text
              }
            },
            y: {
              beginAtZero: true,
              border: {
                display: false,
                dash: [4, 4]
              },
              grid: {
                color: theme.grid
              },
              ticks: {
                color: theme.text,
                padding: 10
              }
            }
          }
    }
  });

  chartInstances.set(canvas, chart);
}
/*
  Native Canvas chart fallback.
  This keeps basic charts working without Chart.js.
*/

function drawNativeChart(canvas, config) {
  const context = canvas.getContext("2d");

  if (!context) return;

  const ratio = window.devicePixelRatio || 1;

  const bounds = canvas.getBoundingClientRect();

  const width = Math.max(bounds.width, 280);
  const height = Math.max(bounds.height, 180);

  canvas.width = width * ratio;
  canvas.height = height * ratio;

  context.scale(ratio, ratio);

  const padding = {
    top: 24,
    right: 18,
    bottom: 34,
    left: 38
  };

  const chartWidth =
    width - padding.left - padding.right;

  const chartHeight =
    height - padding.top - padding.bottom;

  const values = config.values;
  const maxValue = Math.max(...values, 1) * 1.15;

  const theme = getChartTheme();

  context.clearRect(0, 0, width, height);

  // Horizontal grid lines.
  context.strokeStyle = theme.grid;
  context.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y =
      padding.top + (chartHeight / 4) * i;

    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
  }

  if (config.type === "doughnut") {
    const total = values.reduce(
      (sum, value) => sum + value,
      0
    );
   const colors = [
      chartPalette.purple,
      chartPalette.blue,
      chartPalette.cyan,
      chartPalette.green
    ];

    let angle = -Math.PI / 2;

    const centerX = width / 2;
    const centerY = height / 2 - 8;
    const radius = Math.min(width, height) * 0.32;

    values.forEach((value, index) => {
      const slice = (value / total) * Math.PI * 2;

      context.beginPath();
      context.arc(
        centerX,
        centerY,
        radius,
        angle,
        angle + slice
      );

      context.strokeStyle = colors[index % colors.length];
      context.lineWidth = radius * 0.38;
      context.stroke();

      angle += slice;
    });

    chartInstances.set(canvas, {
      config,
      redraw: () => drawNativeChart(canvas, config)
    });

    return;
  }
 const points = values.map((value, index) => {
    const x =
      padding.left +
      (values.length === 1
        ? chartWidth / 2
        : (chartWidth / (values.length - 1)) * index);

    const y =
      padding.top +
      chartHeight -
      (value / maxValue) * chartHeight;

    return { x, y };
  });

  if (config.type === "bar") {
    const slotWidth = chartWidth / values.length;
    const barWidth = slotWidth * 0.55;

    points.forEach((point, index) => {
      const barHeight =
        padding.top + chartHeight - point.y;

      context.fillStyle = config.color;

      context.beginPath();

      context.roundRect(
        point.x - barWidth / 2,
        point.y,
        barWidth,
        barHeight,
        5
      );

      context.fill();
    });
  } else {
  // Fill the area beneath the line.
    context.beginPath();
    context.moveTo(points[0].x, padding.top + chartHeight);

    points.forEach((point) => {
      context.lineTo(point.x, point.y);
    });

    context.lineTo(
      points[points.length - 1].x,
      padding.top + chartHeight
    );

    context.closePath();

    const gradient = context.createLinearGradient(
      0,
      padding.top,
      0,
      padding.top + chartHeight
    );

    gradient.addColorStop(0, `${config.color}45`);
    gradient.addColorStop(1, `${config.color}00`);

    context.fillStyle = gradient;
    context.fill();

    // Smooth line.
    context.beginPath();

    points.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        const previous = points[index - 1];

        const midX = (previous.x + point.x) / 2;
        const midY = (previous.y + point.y) / 2;

        context.quadraticCurveTo(
          previous.x,
          previous.y,
          midX,
          midY
        );
      }
    });

    const last = points[points.length - 1];

    context.lineTo(last.x, last.y);

    context.strokeStyle = config.color;
    context.lineWidth = 3;
    context.lineJoin = "round";
    context.stroke();

    // Data points.
    points.forEach((point) => {
      context.beginPath();
      context.arc(point.x, point.y, 3.5, 0, Math.PI * 2);

      context.fillStyle = config.color;
      context.fill();
    });
  }

  // X-axis labels.
  context.fillStyle = theme.text;
  context.font = "11px system-ui, sans-serif";
  context.textAlign = "center";

  config.labels.forEach((label, index) => {
    const x =
      padding.left +
      (values.length === 1
        ? chartWidth / 2
        : (chartWidth / (values.length - 1)) * index);

    context.fillText(
      label.trim(),
      x,
      height - 10
    );
  });

  chartInstances.set(canvas, {
    config,
    redraw: () => drawNativeChart(canvas, config)
  });
}

/* =========================================================
   7. CHART PERIOD SWITCHER
   Uses real seller sales data.
   ========================================================= */

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-range]");

  if (!button) return;

  const group = button.closest(
    "[data-chart-controls], .chart-controls"
  );

  if (group) {
    $$("button", group).forEach((item) => {
      item.classList.toggle("active", item === button);
    });
  }

  const canvas = $("#revenueChart");
  if (!canvas) return;

  const range = button.dataset.range;

  try {
    const sales = await loadSellerSales("month");
    const chartData = prepareRevenueChartData(sales, range);

    updateRevenueChart(canvas, chartData);

    console.log(`BRICK 4 — Revenue chart changed to ${range}.`);
  } catch (error) {
    console.error(
      "BRICK 4 — Could not update Revenue chart:",
      error
    );
  }
});

// =====================================================
// BRICK S1 — CONNECT SIDEBAR TO EXISTING NAVIGATION
// =====================================================

(() => {
    const sidebar = document.getElementById(
        'nexodraSideNav'
    );

    if (!sidebar) {
        console.warn(
            'BRICK S1 — Sidebar not found.'
        );
        return;
    }

    // Sidebar label -> existing app screen ID.
    const sidebarScreenMap = {
        home: 'storeScreen',
        analytics: 'salesOverviewScreen',
        sell: 'sellScreen',
        inbox: 'inboxScreen',
        reports: 'reportsScreen',
        'preview-store': 'previewStoreBtn',
        profile: 'profileScreen',
        settings: 'settingsScreen'
    };

    sidebar.querySelectorAll(
        '.nexodra-sidebar-link'
    ).forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();

            let targetId =
                link.getAttribute('data-target');

            // Resolve links using their current data-page.
            if (!targetId) {
                const page =
                    link.getAttribute('data-page');

                targetId =
                    sidebarScreenMap[page];
            }

            if (!targetId) {
                console.warn(
                    'BRICK S1 — No target mapped for sidebar link:',
                    link.textContent.trim()
                );
                return;
            }

            // Preview Store is an action button,
            // not a normal dashboard screen.
            if (targetId === 'previewStoreBtn') {
                const previewButton =
                    document.getElementById(
                        'previewStoreBtn'
                    );

                if (previewButton) {
                    previewButton.click();
                } else {
                    console.error(
                        'BRICK S1 — Preview Store button not found.'
                    );
                }
            } else {
                // BRICK S1-A — Open Sales Overview directly.
if (targetId === 'salesOverviewScreen') {
    const salesOverviewScreen =
        document.getElementById(
            'salesOverviewScreen'
        );

    if (!salesOverviewScreen) {
        console.error(
            'BRICK S1-A — Sales Overview screen not found.'
        );
        return;
    }

    // Hide all existing screens.
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // Show Sales Overview.
    salesOverviewScreen.classList.add('active');

    // Initialize charts.
    if (typeof initializeCharts === 'function') {
        initializeCharts();
    }

    // Update the page title.
    if (screenTitle) {
        screenTitle.textContent = 'Sales Overview';
    }

    // Clear active state from bottom navigation.
    navButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Load Sales Overview data.
    if (typeof loadSalesOverview === 'function') {
        loadSalesOverview();
    }

    console.log(
        'BRICK S1-A — Sales Overview opened from sidebar.'
    );

} else {
    // Use normal navigation for all other screens.
    // BRICK R2 — Open Reports directly.
if (targetId === 'reportsScreen') {
    const reportsScreen =
        document.getElementById('reportsScreen');

    if (!reportsScreen) {
        console.error(
            'BRICK R2 — Reports screen not found.'
        );
        return;
    }

    // Hide all screens.
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Activate Reports.
    reportsScreen.classList.add('active');

    // Update the page title if Nexodra has this element.
    if (typeof screenTitle !== 'undefined' && screenTitle) {
        screenTitle.textContent = 'Reports';
    }

    // Clear active state from the regular navigation.
    if (typeof navButtons !== 'undefined' && navButtons) {
        navButtons.forEach(button => {
            button.classList.remove('active');
        });
    }

    console.log(
        'BRICK R2 — Reports screen opened.'
    );

} else {
    // Keep existing navigation behavior for other sidebar links.
    const existingNavButton =
        document.querySelector(
            `.nav-btn[data-target="${targetId}"]`
        );

    if (existingNavButton) {
        existingNavButton.click();
    } else {
        console.warn(
            'BRICK S1 — Existing navigation button not found:',
            targetId
        );
    }
}
}
            }

            // Close the sidebar after choosing a destination.
            const closeButton =
                document.getElementById(
                    'nexodraSidebarClose'
                );

            if (closeButton) {
                closeButton.click();
            }

            console.log(
                'BRICK S1 — Sidebar navigation:',
                link.textContent.trim(),
                '->',
                targetId
            );
        });
    });

    console.log(
        'BRICK S1 — Sidebar navigation connected.'
    );
})();

// =====================================================
// NEXODRA — BRICK 2C: SIDEBAR CONTROLLER
// =====================================================

(() => {
    const menuButton = document.getElementById(
        'nexodraMenuToggle'
    );

    const sidebar = document.getElementById(
        'nexodraSideNav'
    );

    const closeButton = document.getElementById(
        'nexodraSidebarClose'
    );

    // Stop safely if the required HTML is missing.
    if (!menuButton || !sidebar) {
        console.warn(
            'Nexodra sidebar: menu button or sidebar panel not found.'
        );
        return;
    }

    // Create the outside-click backdrop.
    let backdrop = document.querySelector(
        '.nexodra-sidebar-backdrop'
    );

    if (!backdrop) {
        backdrop = document.createElement('div');

        backdrop.className = 'nexodra-sidebar-backdrop';

        backdrop.setAttribute('aria-hidden', 'true');

        document.body.appendChild(backdrop);
    }

    // Ensure the sidebar starts closed.
    function closeSidebar() {
        sidebar.classList.remove('is-open');

        backdrop.classList.remove('is-visible');

        document.body.classList.remove(
            'nexodra-sidebar-open'
        );

        sidebar.setAttribute('aria-hidden', 'true');

        menuButton.setAttribute(
            'aria-expanded',
            'false'
        );

        menuButton.setAttribute(
            'aria-label',
            'Open navigation menu'
        );
    }

    // Open the sidebar.
    function openSidebar() {
        sidebar.classList.add('is-open');

        backdrop.classList.add('is-visible');

        document.body.classList.add(
            'nexodra-sidebar-open'
        );

        sidebar.setAttribute('aria-hidden', 'false');

        menuButton.setAttribute(
            'aria-expanded',
            'true'
        );

        menuButton.setAttribute(
            'aria-label',
            'Close navigation menu'
        );
    }

    // Toggle from the hamburger button.
    menuButton.addEventListener('click', (event) => {
        event.stopPropagation();

        if (sidebar.classList.contains('is-open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    // Close from the sidebar's close button.
    if (closeButton) {
        closeButton.addEventListener(
            'click',
            closeSidebar
        );
    }

    // Close when the user taps outside the panel.
    backdrop.addEventListener(
        'click',
        closeSidebar
    );

    // Close with Escape.
    document.addEventListener('keydown', (event) => {
        if (
            event.key === 'Escape' &&
            sidebar.classList.contains('is-open')
        ) {
            closeSidebar();
            menuButton.focus();
        }
    });

    // Close after tapping outside the sidebar.
    // The backdrop handles outside taps on touchscreens.
    // This also handles clicks outside if another element
    // happens to be above the backdrop.
    document.addEventListener('click', (event) => {
        if (!sidebar.classList.contains('is-open')) {
            return;
        }

        if (
            !sidebar.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            closeSidebar();
        }
    });

    // Keep the current theme styling synchronized.
    function syncSidebarTheme() {
        const isDark = document.body.classList.contains(
            'store-theme-dark'
        );

        sidebar.dataset.theme = isDark ? 'dark' : 'light';
    }

    // Apply the current theme immediately.
    syncSidebarTheme();

    // Observe changes made by the existing theme function.
    const themeObserver = new MutationObserver(() => {
        syncSidebarTheme();
    });

    themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });

    // Start closed on every page load.
    closeSidebar();

    console.log(
        'Nexodra sidebar controller initialized.'
    );
})();

(async function diagnoseNexodraServiceWorker() {
    const result = {
        secureContext: window.isSecureContext,
        serviceWorkerSupported: 'serviceWorker' in navigator,
        notificationPermission:
            'Notification' in window
                ? Notification.permission
                : 'unsupported',
        controllerActive: !!navigator.serviceWorker?.controller,
        savedRegistration:
            !!window.nexodraServiceWorkerRegistration
    };

    try {
        if ('serviceWorker' in navigator) {
            const registration =
                await navigator.serviceWorker.getRegistration();

            result.registrationFound = !!registration;
            result.activeWorker =
                registration?.active?.state || 'none';
            result.showNotificationSupported =
                typeof registration?.showNotification === 'function';
        }

        console.table(result);
        console.log('NEXODRA SERVICE WORKER DIAGNOSTIC:', result);
    } catch (error) {
        console.error('NEXODRA SERVICE WORKER DIAGNOSTIC FAILED:', error);
    }
})();

console.log(
    'NEXODRA — Notification JavaScript file loaded.'
);


/* =========================================
   BRICK 3A — SUBSCRIBE AND SAVE TO BACKEND
========================================= */

function nexodraDecodeVapidPublicKey(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);

    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const raw = atob(base64);

    return Uint8Array.from(raw, char => char.charCodeAt(0));
}

async function nexodraSubscribeToPush() {
    try {
        if (!("serviceWorker" in navigator) ||
            !("PushManager" in window)) {
            throw new Error("Push notifications are not supported.");
        }

        if (typeof NEXODRA_API_URL === "undefined" ||
            typeof NEXODRA_VAPID_PUBLIC_KEY === "undefined" ||
            typeof supabaseClient === "undefined") {
            throw new Error("Nexodra configuration is missing.");
        }

        if (Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();

            if (permission !== "granted") {
                throw new Error("Notification permission was not granted.");
            }
        }

        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session?.access_token) {
            throw new Error("Please sign in before enabling push notifications.");
        }

        const registration = await navigator.serviceWorker.ready;

        let subscription =
            await registration.pushManager.getSubscription();

        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey:
                    nexodraDecodeVapidPublicKey(
                        NEXODRA_VAPID_PUBLIC_KEY
                    )
            });
        }

        const json = subscription.toJSON();

        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
            throw new Error("The browser returned an incomplete subscription.");
        }

        const response = await fetch(
            `${NEXODRA_API_URL}/push/subscribe`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    endpoint: json.endpoint,
                    p256dh: json.keys.p256dh,
                    auth: json.keys.auth
                })
            }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                result.detail || `Subscription save failed (${response.status}).`
            );
        }

        console.info("BRICK 3A — Push subscription saved.", result);

        return {
            success: true,
            message: "Push notifications enabled and saved."
        };

    } catch (error) {
        console.error("BRICK 3A — Subscription failed:", error);

        return {
            success: false,
            message: error.message || "Could not enable push notifications."
        };
    }
}

/* =========================================
   BRICK 3B — SEND BACKEND TEST PUSH
========================================= */

async function nexodraSendBackendPushTest() {
    try {
        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session?.access_token) {
            throw new Error("Please sign in before testing push notifications.");
        }

        const response = await fetch(
            `${NEXODRA_API_URL}/push/test`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    title: "Nexodra push test",
                    body: "Your backend push notification reached the send request.",
                })
            }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                result.detail || `Push test failed (${response.status}).`
            );
        }

        console.info("BRICK 3B — Backend push test response:", result);

        return {
            success: true,
            message: "Backend accepted the push send request.",
            result
        };

    } catch (error) {
        console.error("BRICK 3B — Backend push test failed:", error);

        return {
            success: false,
            message: error.message || "Backend push test failed."
        };
    }
}


/* =========================================
   BRICK 3C — ENABLE PUSH BUTTON
========================================= */

(function nexodraSetupEnablePushButton() {

    const button = document.getElementById(
        "nexodra-enable-push"
    );

    const resultElement = document.getElementById(
        "nexodra-enable-push-result"
    );

    if (!button || !resultElement) {
        console.warn(
            "BRICK 3C — Push button or result element not found."
        );
        return;
    }

    button.addEventListener("click", async function () {

        button.disabled = true;
        button.textContent = "Enabling Push...";
        resultElement.textContent =
            "Creating or checking your push subscription...";

        try {

            if (
                typeof nexodraSubscribeToPush !== "function"
            ) {
                throw new Error(
                    "nexodraSubscribeToPush() is not available."
                );
            }

            const result = await nexodraSubscribeToPush();

            if (!result || result.success !== true) {
                throw new Error(
                    result?.message ||
                    "Push subscription could not be saved."
                );
            }

            resultElement.textContent =
                "SUCCESS — " + result.message;

            button.textContent = "Push Enabled";

            console.info(
                "BRICK 3C — Push enabled successfully."
            );

        } catch (error) {

            resultElement.textContent =
                "FAILED — " +
                (error.message || "Unknown error");

            button.textContent = "Try Again";

            console.error(
                "BRICK 3C — Enable push failed:",
                error
            );

        } finally {

            button.disabled = false;

        }

    });

})();


/* =====================================================
   NEXODRA — HIRE PURCHASE WORKFLOW CONTROLLER
   Connects the POS entry button to screens 2–5.
   Does not replace existing Nexodra functionality.
===================================================== */

(() => {
    'use strict';

    function initNexodraHirePurchaseWorkflow() {
        const entryButton = document.getElementById('sellHireEntryBtn');
        const workflow = document.getElementById('hirePurchaseWorkflow');

        if (!entryButton || !workflow) {
            console.warn(
                'Hire Purchase: entry button or workflow HTML not found.'
            );
            return;
        }

        // Prevent duplicate initialization.
        if (workflow.dataset.hpInitialized === 'true') return;
        workflow.dataset.hpInitialized = 'true';

        const screens = [
            document.getElementById('hpCustomerScreen'),
            document.getElementById('hpProductsScreen'),
            document.getElementById('hpPlanScreen'),
            document.getElementById('hpReviewScreen')
        ];

        const progressSteps = workflow.querySelectorAll('[data-hp-step]');

        if (screens.some(screen => !screen)) {
            console.error(
                'Hire Purchase: one or more screen sections are missing.'
            );
            return;
        }

        let currentStep = 1;


      
function showStep(step) {
    if (step < 1 || step > 4) return;

    currentStep = step;

    // Hide the other dedicated app screens.
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Open Hire Purchase as its own app screen.
    workflow.hidden = false;
    workflow.classList.add('active');

    // Show only the requested Hire Purchase step.
    screens.forEach((screen, index) => {
        const active = index + 1 === step;
        screen.hidden = !active;

        if (active) {
            screen.setAttribute('aria-current', 'step');
        } else {
            screen.removeAttribute('aria-current');
        }
    });

    // Update the progress indicator.
    progressSteps.forEach(item => {
        const itemStep = Number(item.dataset.hpStep);

        item.classList.toggle('is-active', itemStep === step);
        item.classList.toggle('is-complete', itemStep < step);

        if (itemStep === step) {
            item.setAttribute('aria-current', 'step');
        } else {
            item.removeAttribute('aria-current');
        }
    });

    window.scrollTo({ top: 0, behavior: 'auto' });
}

function closeWorkflow() {
    workflow.hidden = true;
    workflow.classList.remove('active');

    // Return to the POS screen.
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const sellScreen = document.getElementById('sellScreen');

    if (sellScreen) {
        sellScreen.classList.add('active');
        sellScreen.scrollTop = 0;
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
}

        
      
        
        // =========================================
        // HP-1 — NORMAL POS CART TRANSFER
        // Live Selling cart is NOT accessed.
        // =========================================

        let hpSaleItems = [];

        
let hpCustomerData = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    reference: ''
};


        function renderHirePurchaseProducts() {

            const list = document.getElementById(
                'hpProductsList'
            );

            if (!list) return;

            const subtotal = hpSaleItems.reduce(
                (sum, item) => {
                    return sum +
                        Number(item.price || 0) *
                        Number(item.quantity || 0);
                },
                0
            );

            const discount = Number(
                sellDiscountAmount || 0
            );

            const tax = Number(
                sellTaxAmount || 0
            );

            const total = Math.max(
                0,
                subtotal - discount + tax
            );

            const depositInput = document.getElementById(
                'hpDepositAmount'
            );

            const deposit = Math.max(
                0,
                Number(depositInput?.value || 0)
            );

            const balance = Math.max(
                0,
                total - deposit
            );

            // Product count
            const count = document.getElementById(
                'hpProductsCount'
            );

            if (count) {
                count.textContent =
                    `${hpSaleItems.length} product types · ` +
                    `${hpSaleItems.reduce(
                        (sum, item) =>
                            sum + Number(item.quantity || 0),
                        0
                    )} items`;
            }

            // Safe text escaping
            function escapeHPText(value) {
                return String(value ?? '').replace(
                    /[&<>"']/g,
                    char => ({
                        '&': '&amp;',
                        '<': '&lt;',
                        '>': '&gt;',
                        '"': '&quot;',
                        "'": '&#39;'
                    }[char])
                );
            }

            // Render copied cart items
            if (hpSaleItems.length === 0) {

                list.innerHTML = `
                    <div class="hp-product-empty">
                        <strong>No products transferred</strong>
                        <span>Add products to the normal POS cart.</span>
                    </div>
                `;

            } else {

                list.innerHTML = hpSaleItems.map(item => {

                    const title = escapeHPText(
                        item.title || 'Product'
                    );

                    const quantity = Number(
                        item.quantity || 0
                    );

                    const price = Number(
                        item.price || 0
                    );

                    const lineTotal = price * quantity;

                    return `
                        <div class="hp-product-row">
                            <div class="hp-product-info">
                                <strong>${title}</strong>
                                <span>
                                    ${quantity} × ${formatCurrency(price)}
                                </span>
                            </div>

                            <strong>
                                ${formatCurrency(lineTotal)}
                            </strong>
                        </div>
                    `;

                }).join('');

            }

            // Review totals
            const totals = {
                hpProductsSubtotal: subtotal,
                hpProductsDiscount: discount,
                hpProductsTax: tax,
                hpProductsTotal: total,
                hpProductsDeposit: deposit,
                hpProductsBalance: balance
            };

            Object.entries(totals).forEach(
                ([id, amount]) => {

                    const element =
                        document.getElementById(id);

                    if (element) {
                        element.textContent =
                            formatCurrency(amount);
                    }

                }
            );

            // Connect Step 2 remaining balance to Step 3.
updateHirePurchasePlan(balance);
          
        }


      // =========================================
// HP — STEP 3 LIVE PAYMENT PLAN UPDATES
// =========================================

const hpPlanInputs = [
    'hpInstallmentCount',
    'hpChargeAmount',
    'hpInstallmentFrequency'
];

hpPlanInputs.forEach(id => {

    const input = document.getElementById(id);

    if (input) {
        input.addEventListener('input', () => {

            // Read the actual balance from Step 2.
            const balanceElement = document.getElementById(
                'hpProductsBalance'
            );

            const balance = Number(
                (balanceElement?.textContent || '')
                    .replace(/[^\d.-]/g, '')
            ) || 0;

            updateHirePurchasePlan(balance);

        });

        input.addEventListener('change', () => {

            const balanceElement = document.getElementById(
                'hpProductsBalance'
            );

            const balance = Number(
                (balanceElement?.textContent || '')
                    .replace(/[^\d.-]/g, '')
            ) || 0;

            updateHirePurchasePlan(balance);

        });
    }

});

// =========================================
// HP — STEP 4 REVIEW AGREEMENT
// =========================================

function renderHirePurchaseReview() {

    const getValue = id =>
        document.getElementById(id)?.value?.trim() || '';

    const setText = (id, value) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    };


    // -------------------------------------
    // STEP 1 — CUSTOMER DETAILS
    // -------------------------------------

    const firstName = getValue('hpCustomerFirstName');
    const lastName = getValue('hpCustomerLastName');
    const phone = getValue('hpCustomerPhone');
    const email = getValue('hpCustomerEmail');
    const address = getValue('hpCustomerAddress');

    setText(
        'hpReviewCustomerName',
        `${firstName} ${lastName}`.trim() || 'Customer not selected'
    );

    setText('hpReviewCustomerPhone', phone || '—');
    setText('hpReviewCustomerEmail', email || '—');
    setText('hpReviewCustomerAddress', address || '—');


    // -------------------------------------
    // STEP 2 — PRODUCTS AND SALE TOTAL
    // -------------------------------------

    const saleTotal = Number(
        (document.getElementById('hpProductsTotal')
            ?.textContent || '')
            .replace(/[^\d.-]/g, '')
    ) || 0;

    const deposit = Math.max(
        0,
        Number(getValue('hpDepositAmount')) || 0
    );

    const remainingBalance = Math.max(
        0,
        saleTotal - deposit
    );

    setText(
        'hpReviewSaleTotal',
        formatCurrency(saleTotal)
    );

    setText(
        'hpReviewDeposit',
        formatCurrency(deposit)
    );

    setText(
        'hpReviewPrincipal',
        formatCurrency(remainingBalance)
    );


    // -------------------------------------
    // STEP 2 — PRODUCT LIST
    // -------------------------------------

    const productList = document.getElementById(
        'hpReviewProductsList'
    );

    if (productList) {

        if (!Array.isArray(hpSaleItems) || hpSaleItems.length === 0) {

            productList.innerHTML = `
                <p class="hp-muted">
                    No products selected.
                </p>
            `;

        } else {

            productList.innerHTML = hpSaleItems.map(item => {

                const title = String(
                    item.title || 'Product'
                ).replace(/[&<>"']/g, char => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char]));

                const quantity = Number(
                    item.quantity || 0
                );

                const price = Number(
                    item.price || 0
                );

                const lineTotal = quantity * price;

                return `
                    <div class="hp-product-row">

                        <div class="hp-product-info">
                            <strong>${title}</strong>

                            <span>
                                ${quantity} × ${formatCurrency(price)}
                            </span>
                        </div>

                        <strong>
                            ${formatCurrency(lineTotal)}
                        </strong>

                    </div>
                `;

            }).join('');

        }
    }


    // -------------------------------------
    // STEP 3 — PAYMENT PLAN
    // -------------------------------------

    const frequency = getValue(
        'hpInstallmentFrequency'
    ) || 'weekly';

    const installmentCount = Math.max(
        1,
        Number(getValue('hpInstallmentCount')) || 1
    );

    
const fixedCharge = Math.max(
    0,
    Number(getValue('hpChargeAmount')) || 0
);

// Apply the fixed charge once.
const totalFees = fixedCharge;

// Add the charge to the outstanding balance.
const totalRemainingToPay =
    remainingBalance + totalFees;

// Calculate the installment amount.
const installmentAmount =
    totalRemainingToPay / installmentCount;


  
    const firstDueDate = getValue(
        'hpFirstDueDate'
    );

    const note = getValue(
        'hpAgreementNote'
    );


    // Frequency label
    const frequencyLabels = {
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly'
    };

    const frequencyLabel =
        frequencyLabels[frequency] || 'Weekly';


    setText(
        'hpReviewFrequency',
        frequencyLabel
    );

    setText(
        'hpReviewCount',
        String(installmentCount)
    );

    setText(
        'hpReviewFirstDue',
        firstDueDate || 'Not set'
    );

    setText(
        'hpReviewCharges',
        formatCurrency(totalFees)
    );

    setText(
        'hpReviewRemainingTotal',
        formatCurrency(totalRemainingToPay)
    );

    setText(
        'hpReviewInstallmentLabel',
        `Estimated ${frequency.toLowerCase()} installment`
    );

    setText(
        'hpReviewInstallmentAmount',
        formatCurrency(installmentAmount)
    );


    // -------------------------------------
    // AGREEMENT NOTE
    // -------------------------------------

    const noteContainer = document.getElementById(
        'hpReviewNoteContainer'
    );

    const noteElement = document.getElementById(
        'hpReviewNote'
    );

    if (noteContainer && noteElement) {

        noteElement.textContent = note;

        noteContainer.hidden = !note;

    }

}
      
      // =========================================
// HP — STEP 3 PAYMENT PLAN CALCULATION
// =========================================

function updateHirePurchasePlan(balance) {

    const remainingBalance = Math.max(
        0,
        Number(balance || 0)
    );

    const installmentCount = Math.max(
        1,
        Number(
            document.getElementById(
                'hpInstallmentCount'
            )?.value || 1
        )
    );

    
const fixedCharge = Math.max(
    0,
    Number(
        document.getElementById(
            'hpChargeAmount'
        )?.value || 0
    )
);

// Apply the fixed charge once.
const totalFees = fixedCharge;

// Add the charge to the remaining balance.
const totalRemainingToPay =
    remainingBalance + totalFees;

// Divide the total repayment into installments.
const installmentAmount =
    totalRemainingToPay / installmentCount;


    // Step 3 balance before fees
    const balanceElement = document.getElementById(
        'hpPlanRemainingBalance'
    );

    if (balanceElement) {
        balanceElement.textContent =
            formatCurrency(remainingBalance);
    }


    // Estimated payment schedule card
    const principalElement = document.getElementById(
        'hpPlanPrincipal'
    );

    const chargesElement = document.getElementById(
        'hpPlanCharges'
    );

    const totalElement = document.getElementById(
        'hpPlanTotal'
    );

    const installmentElement = document.getElementById(
        'hpInstallmentEstimate'
    );

    const installmentLabel = document.getElementById(
        'hpInstallmentEstimateLabel'
    );


    if (principalElement) {
        principalElement.textContent =
            formatCurrency(remainingBalance);
    }

    if (chargesElement) {
        chargesElement.textContent =
            formatCurrency(totalFees);
    }

    if (totalElement) {
        totalElement.textContent =
            formatCurrency(totalRemainingToPay);
    }

    if (installmentElement) {
        installmentElement.textContent =
            formatCurrency(installmentAmount);
    }


    // Dynamic installment period label
    const frequency = document.getElementById(
        'hpInstallmentFrequency'
    )?.value || 'weekly';

    const frequencyLabels = {
        daily: 'daily',
        weekly: 'weekly',
        monthly: 'monthly'
    };

    const periodLabel =
        frequencyLabels[frequency] || 'weekly';

    if (installmentLabel) {
        installmentLabel.textContent =
            `Estimated ${periodLabel} installment`;
    }

}

        // Open Hire Purchase using NORMAL POS cart only.
        entryButton.addEventListener('click', () => {

            // Do not access Live Selling cart.
            if (
                !Array.isArray(currentSaleItems) ||
                currentSaleItems.length === 0
            ) {

                alert(
                    'Please add products to the normal ' +
                    'selling cart first.'
                );

                return;
            }

            // Snapshot: HP gets its own copy.
            hpSaleItems = currentSaleItems.map(
                item => ({
                    ...item,
                    quantity: Number(item.quantity || 0),
                    price: Number(item.price || 0)
                })
            );

            renderHirePurchaseProducts();

            // Open customer screen.
            showStep(1);

        });


        // Refresh deposit and balance when deposit changes.
        document.getElementById('hpDepositAmount')
            ?.addEventListener(
                'input',
                renderHirePurchaseProducts
            );


        // Back / cancel / exit actions.
        document.getElementById('hpExitBtn')
            ?.addEventListener('click', closeWorkflow);

        document.getElementById('hpCustomerCancelBtn')
            ?.addEventListener('click', closeWorkflow);

        document.getElementById('hpProductsBackBtn')
            ?.addEventListener('click', () => showStep(1));

        document.getElementById('hpPlanBackBtn')
            ?.addEventListener('click', () => showStep(2));

        document.getElementById('hpReviewBackBtn')
            ?.addEventListener('click', () => showStep(3));

        // Forward navigation.
        // Data validation will be added in the next implementation step.




      
document.getElementById('hpCustomerNextBtn')
    ?.addEventListener('click', () => {

        const firstNameInput = document.getElementById(
            'hpCustomerFirstName'
        );

        const lastNameInput = document.getElementById(
            'hpCustomerLastName'
        );

        const phoneInput = document.getElementById(
            'hpCustomerPhone'
        );

        const firstName = firstNameInput?.value.trim() || '';
        const lastName = lastNameInput?.value.trim() || '';
        const phone = phoneInput?.value.trim() || '';

        // Validate required customer fields.
        if (!firstName) {
            alert('Please enter the customer first name.');

            firstNameInput?.focus();

            return;
        }

        if (!lastName) {
            alert('Please enter the customer last name.');

            lastNameInput?.focus();

            return;
        }

        if (!phone) {
            alert('Please enter the customer phone number.');

            phoneInput?.focus();

            return;
        }

        // Save customer information.
        renderHirePurchaseCustomer();

        // Refresh copied normal POS products and totals.
        renderHirePurchaseProducts();

        // Continue to product review.
        showStep(2);

    });


      
function renderHirePurchaseCustomer() {

    const firstName = document.getElementById(
        'hpCustomerFirstName'
    )?.value.trim() || '';

    const lastName = document.getElementById(
        'hpCustomerLastName'
    )?.value.trim() || '';

    const phone = document.getElementById(
        'hpCustomerPhone'
    )?.value.trim() || '';

    const email = document.getElementById(
        'hpCustomerEmail'
    )?.value.trim() || '';

    const address = document.getElementById(
        'hpCustomerAddress'
    )?.value.trim() || '';

    const reference = document.getElementById(
        'hpCustomerReference'
    )?.value.trim() || '';

    // Save temporary Hire Purchase customer state.
    hpCustomerData = {
        firstName,
        lastName,
        phone,
        email,
        address,
        reference
    };

    const customerName =
        `${firstName} ${lastName}`.trim();

    const nameElement = document.getElementById(
        'hpProductsCustomerName'
    );

    const phoneElement = document.getElementById(
        'hpProductsCustomerPhone'
    );

    if (nameElement) {
        nameElement.textContent =
            customerName || 'Customer not selected';
    }

    if (phoneElement) {
        phoneElement.textContent =
            phone || 'Customer phone number';
    }
}

        document.getElementById('hpProductsNextBtn')
            ?.addEventListener('click', () => showStep(3));

        // Step 3 → Step 4
document.getElementById('hpPlanNextBtn')
    ?.addEventListener('click', () => {

        // Refresh the latest agreement details.
        renderHirePurchaseReview();

        // Open Step 4.
        showStep(4);

    });

        // Review screen edit buttons.
        document.getElementById('hpEditCustomerBtn')
            ?.addEventListener('click', () => showStep(1));

        document.getElementById('hpEditProductsBtn')
            ?.addEventListener('click', () => showStep(2));

        document.getElementById('hpEditPlanBtn')
            ?.addEventListener('click', () => showStep(3));



      
        
/* =========================================
   HIRE PURCHASE — SAVE AGREEMENT TO SUPABASE
   BRICK 1: AGREEMENT + INSTALLMENTS
========================================= */

document.getElementById('hpConfirmAgreementBtn')
    ?.addEventListener('click', async function () {

        const button = this;

        // Prevent duplicate submissions.
        if (button.dataset.saving === 'true') return;

        const getValue = id =>
            document.getElementById(id)?.value?.trim() || '';

        const getNumber = id =>
            Math.max(0, Number(getValue(id)) || 0);

        const firstName = getValue('hpCustomerFirstName');
        const lastName = getValue('hpCustomerLastName');
        const phone = getValue('hpCustomerPhone');

        const email = getValue('hpCustomerEmail');
        const address = getValue('hpCustomerAddress');
        const reference = getValue('hpCustomerReference');

        const frequency =
            getValue('hpInstallmentFrequency') || 'weekly';

        const installmentCount = Math.max(
            1,
            Math.floor(getNumber('hpInstallmentCount'))
        );

        const firstDueDate = getValue('hpFirstDueDate');
        const note = getValue('hpAgreementNote');

        // Validate customer.
        if (!firstName || !lastName || !phone) {
            alert(
                'Please complete the customer first name, ' +
                'last name, and phone number.'
            );
            return;
        }

        // Validate products.
        if (
            !Array.isArray(hpSaleItems) ||
            hpSaleItems.length === 0
        ) {
            alert('Please add products to the agreement.');
            return;
        }

        // Validate first installment date.
        if (!firstDueDate) {
            alert('Please select the first installment date.');
            return;
        }

        if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
            alert('Please select a valid installment frequency.');
            return;
        }

        // Supabase authentication.
        if (
            typeof supabaseClient === 'undefined' ||
            !supabaseClient
        ) {
            alert('Supabase is not connected.');
            return;
        }

        button.dataset.saving = 'true';
        button.disabled = true;

        const originalButtonText = button.textContent;

        button.textContent = 'Saving agreement...';

        let agreementId = null;

        try {

            // ---------------------------------
            // 1. GET AUTHENTICATED SELLER
            // ---------------------------------

            const {
                data: authData,
                error: authError
            } = await supabaseClient.auth.getUser();

            if (authError) throw authError;

            const user = authData?.user;

            if (!user) {
                throw new Error(
                    'Please sign in before saving an agreement.'
                );
            }

            const ownerId = user.id;

            // ---------------------------------
            // 2. CALCULATE AGREEMENT TOTALS
            // ---------------------------------

            const saleTotal = Math.max(
                0,
                Number(
                    (document.getElementById('hpProductsTotal')
                        ?.textContent || '')
                        .replace(/[^\d.-]/g, '')
                ) || 0
            );

            const deposit = getNumber('hpDepositAmount');

            if (deposit > saleTotal) {
                throw new Error(
                    'The deposit cannot be greater than the sale total.'
                );
            }

            const principal = saleTotal - deposit;

            // Fixed charge applies ONCE to the agreement.
            const fixedCharge = getNumber('hpChargeAmount');

            const chargesTotal = fixedCharge;

            const agreementTotal =
                principal + chargesTotal;

            const installmentAmount =
                agreementTotal / installmentCount;

            // ---------------------------------
            // 3. PREPARE PRODUCT ITEMS
            // ---------------------------------

            const items = hpSaleItems.map(item => {

                const quantity = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;

                return {
                    ...item,
                    quantity,
                    price,
                    line_total: quantity * price
                };

            });

            // ---------------------------------
            // 4. INSERT AGREEMENT
            // ---------------------------------

            const agreementPayload = {

                owner_id: ownerId,

                customer_first_name: firstName,
                customer_last_name: lastName,
                customer_phone: phone,

                customer_email: email || null,
                customer_address: address || null,
                customer_reference: reference || null,

                items,

                // Current HP screen provides sale total.
                // No separate discount/tax inputs were confirmed.
                subtotal: saleTotal,
                discount: 0,
                tax: 0,
                sale_total: saleTotal,

                deposit_amount: deposit,
                principal_amount: principal,

                charge_type: 'fixed',
                charge_amount: fixedCharge,
                charges_total: chargesTotal,

                agreement_total: agreementTotal,

                installment_frequency: frequency,
                installment_count: installmentCount,

                first_due_date: firstDueDate,

                agreement_note: note || null,

                status: 'active'

            };

            const {
                data: savedAgreement,
                error: agreementError
            } = await supabaseClient
                .from('hire_purchase_agreements')
                .insert(agreementPayload)
                .select('id')
                .single();

            if (agreementError) throw agreementError;

            agreementId = savedAgreement.id;

            // ---------------------------------
            // 5. BUILD INSTALLMENT DUE DATES
            // ---------------------------------

            const installments = [];

            // Use date-only parsing to avoid timezone shifting.
            const [year, month, day] =
                firstDueDate.split('-').map(Number);

            for (
                let installmentNumber = 1;
                installmentNumber <= installmentCount;
                installmentNumber++
            ) {

                const dueDate = new Date(
                    Date.UTC(year, month - 1, day)
                );

                if (frequency === 'daily') {

                    dueDate.setUTCDate(
                        dueDate.getUTCDate() +
                        (installmentNumber - 1)
                    );

                } else if (frequency === 'weekly') {

                    dueDate.setUTCDate(
                        dueDate.getUTCDate() +
                        7 * (installmentNumber - 1)
                    );

                } else if (frequency === 'monthly') {

                    // Keep the original day when possible.
                    // Clamp to the final day of shorter months.
                    const targetMonth =
                        month - 1 + installmentNumber - 1;

                    const targetYear =
                        year + Math.floor(targetMonth / 12);

                    const normalizedMonth =
                        ((targetMonth % 12) + 12) % 12;

                    const lastDay = new Date(
                        Date.UTC(
                            targetYear,
                            normalizedMonth + 1,
                            0
                        )
                    ).getUTCDate();

                    dueDate.setUTCFullYear(
                        targetYear,
                        normalizedMonth,
                        Math.min(day, lastDay)
                    );

                }

                const dueDateString =
                    dueDate.toISOString().slice(0, 10);

                // Adjust final installment for rounding.
                const scheduledAmount =
                    installmentNumber === installmentCount
                        ? agreementTotal -
                            installmentAmount *
                            (installmentCount - 1)
                        : installmentAmount;

                installments.push({

                    agreement_id: agreementId,
                    owner_id: ownerId,

                    installment_number: installmentNumber,

                    due_date: dueDateString,

                    scheduled_amount: Number(
                        scheduledAmount.toFixed(2)
                    ),

                    amount_paid: 0,

                    outstanding_amount: Number(
                        scheduledAmount.toFixed(2)
                    ),

                    status: 'pending'

                });

            }

            // ---------------------------------
            // 6. INSERT INSTALLMENTS
            // ---------------------------------

            const {
                error: installmentError
            } = await supabaseClient
                .from('hire_purchase_installments')
                .insert(installments);

            if (installmentError) {

                // Attempt to remove the agreement if its
                // installment records could not be saved.
                const {
                    error: rollbackError
            } = await supabaseClient
                    .from('hire_purchase_agreements')
                    .delete()
                    .eq('id', agreementId)
                    .eq('owner_id', ownerId);

                if (rollbackError) {
                    console.error(
                        'Hire Purchase rollback failed:',
                        rollbackError
                    );
                }

                throw installmentError;
            }

            // ---------------------------------
            // 7. SUCCESS
            // ---------------------------------

            console.log(
                'Hire Purchase agreement saved:',
                agreementId
            );

            alert(
                'Hire Purchase agreement saved successfully.'
            );

            // Agreement and installments are saved.
            // Do not create payment records here.

        } catch (error) {

            console.error(
                'Hire Purchase agreement save failed:',
                error
            );

            alert(
                'Could not save the Hire Purchase agreement.\n\n' +
                (error?.message || 'Please try again.')
            );

        } finally {

            button.dataset.saving = 'false';
            button.disabled = false;

            button.textContent = originalButtonText;

        }

    });
      
        // Keep the workflow closed until the seller taps Hire Purchase.
        workflow.hidden = true;

        console.log('Nexodra Hire Purchase workflow initialized.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initNexodraHirePurchaseWorkflow,
            { once: true }
        );
    } else {
        initNexodraHirePurchaseWorkflow();
    }
})();


/* =========================================
   HP-2 — REAL SUPABASE HIRE PURCHASE DASHBOARD
   BRICK 2
========================================= */
(() => {
    'use strict';

    const openButton = document.getElementById('sellHirePurchaseBtn');
    const dashboard = document.getElementById('hirePurchaseScreen');
    const backButton = document.getElementById('hpDashboardBackBtn');
    const list = document.getElementById('hpAgreementList');
    const search = document.getElementById('hpAgreementSearch');
    const count = document.getElementById('hpRecordCount');
    const filterButtons = document.querySelectorAll('[data-hp-filter]');

    if (!openButton || !dashboard || !list) {
        console.warn('HP-2: dashboard HTML or entry button not found.');
        return;
    }

    // Real records loaded from Supabase.
    let agreements = [];
    let currentFilter = 'all';
    let loading = false;

    const statusLabels = {
        incoming: 'Incoming',
        overdue: 'Overdue',
        active: 'Active',
        fulfilled: 'Fulfilled'
    };

    const money = amount =>
        'UGX ' + Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

    const dateLabel = value => {
        if (!value) return 'Not scheduled';

        const date = new Date(value + 'T12:00:00');

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const escapeHTML = value =>
        String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));

    function getCustomerName(agreement) {
        return (
            `${agreement.customer_first_name || ''} ` +
            `${agreement.customer_last_name || ''}`
        ).trim() || 'Customer';
    }

    function getProducts(agreement) {
        if (!Array.isArray(agreement.items)) return [];

        return agreement.items.map(item => ({
            name: item.title || item.name || item.product_name || 'Product',
            quantity: Number(item.quantity || 0),
            price: Number(item.price || 0)
        }));
    }

    function getProductLabel(agreement) {
        const products = getProducts(agreement);

        if (!products.length) return 'No products';

        const first = products[0].name;

        if (products.length === 1) return first;

        return `${first} + ${products.length - 1} more`;
    }

    function getAgreementStatus(agreement, installments) {
        const balance = installments.reduce(
            (sum, item) => sum + Number(item.outstanding_amount || 0),
            0
        );

        if (balance <= 0) return 'fulfilled';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const hasOverdue = installments.some(item => {
            const outstanding = Number(item.outstanding_amount || 0);

            if (outstanding <= 0 || !item.due_date) return false;

            const dueDate = new Date(item.due_date + 'T00:00:00');

            return dueDate < today;
        });

        if (hasOverdue) return 'overdue';

        return 'active';
    }

    function getAgreementView(agreement) {
        const installments = Array.isArray(agreement.installments)
            ? agreement.installments
            : [];

        const paid = installments.reduce(
            (sum, item) => sum + Number(item.amount_paid || 0),
            0
        );

        const balance = installments.reduce(
            (sum, item) =>
                sum + Number(item.outstanding_amount || 0),
            0
        );

        const sortedInstallments = [...installments].sort(
            (a, b) =>
                Number(a.installment_number) -
                Number(b.installment_number)
        );

        const nextInstallment = sortedInstallments.find(
            item => Number(item.outstanding_amount || 0) > 0
        );

        const total = Number(agreement.agreement_total || 0);

        const status = getAgreementStatus(
            agreement,
            installments
        );

        return {
            id: agreement.id,
            name: getCustomerName(agreement),
            phone: agreement.customer_phone || '',
            product: getProductLabel(agreement),
            total,
            paid,
            balance,
            nextAmount: nextInstallment
                ? Number(nextInstallment.outstanding_amount || 0)
                : 0,
            nextDate: nextInstallment?.due_date || '',
            nextNumber: nextInstallment?.installment_number || null,
            status
        };
    }

    // -----------------------------------------
    // LOAD REAL AGREEMENTS FROM SUPABASE
    // -----------------------------------------

    async function loadAgreements() {
        if (loading) return;

        loading = true;

        list.innerHTML = `
            <div class="hp-empty-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <strong>Loading agreements...</strong>
            </div>
        `;

        try {

            if (
                typeof supabaseClient === 'undefined' ||
                !supabaseClient
            ) {
                throw new Error('Supabase is not connected.');
            }

            const {
                data: authData,
                error: authError
            } = await supabaseClient.auth.getUser();

            if (authError) throw authError;

            const user = authData?.user;

            if (!user) {
                throw new Error('Please sign in to view agreements.');
            }

            // Load agreements belonging to authenticated seller.
            const {
                data: agreementRows,
                error: agreementError
            } = await supabaseClient
                .from('hire_purchase_agreements')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (agreementError) throw agreementError;

            const rows = agreementRows || [];

            if (!rows.length) {
                agreements = [];
                renderAgreements();
                return;
            }

            // Load installment rows for these agreements.
            const agreementIds = rows.map(item => item.id);

            const {
                data: installmentRows,
                error: installmentError
            } = await supabaseClient
                .from('hire_purchase_installments')
                .select('*')
                .eq('owner_id', user.id)
                .in('agreement_id', agreementIds)
                .order('installment_number', { ascending: true });

            if (installmentError) throw installmentError;

            const allInstallments = installmentRows || [];

            // Attach installments to their agreement.
            agreements = rows.map(agreement => ({
                ...agreement,

                installments: allInstallments.filter(
                    installment =>
                        installment.agreement_id === agreement.id
                )
            }));

            renderAgreements();

            console.log(
                'HP-2: Supabase agreements loaded:',
                agreements.length
            );

        } catch (error) {

            console.error(
                'HP-2: Could not load agreements:',
                error
            );

            list.innerHTML = `
                <div class="hp-empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <strong>Could not load agreements</strong>
                    <p>${escapeHTML(error?.message || 'Please try again.')}</p>
                    <button type="button" class="hp-view-btn"
                        data-hp-retry>
                        Retry
                    </button>
                </div>
            `;

            if (count) count.textContent = 'Unable to load';

        } finally {
            loading = false;
        }
    }

    // -----------------------------------------
    // RENDER REAL AGREEMENTS
    // -----------------------------------------

    function renderAgreements() {


/* =========================================
   HP — REAL AGREEMENT METRICS
========================================= */

function updateHirePurchaseMetrics() {

    const totalAgreements =
        agreements.length;

    let totalOutstanding = 0;
    let overdueAgreements = 0;
    let fulfilledAgreements = 0;

    agreements.forEach(agreement => {

        const view =
            getAgreementView(agreement);

        const balance =
            Math.max(
                0,
                Number(view.balance || 0)
            );

        totalOutstanding += balance;

        if (view.status === 'overdue') {
            overdueAgreements++;
        }

        if (view.status === 'fulfilled') {
            fulfilledAgreements++;
        }

    });

    // -------------------------------------
    // FORMAT CURRENCY
    // -------------------------------------

    const formatPortfolioMoney = amount => {

        return new Intl.NumberFormat(
            undefined,
            {
                style: 'currency',
                currency: 'USD'
            }
        ).format(amount);

    };

    // -------------------------------------
    // UPDATE METRIC ELEMENTS
    // -------------------------------------

    const setMetric = (id, value) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    };

    setMetric(
        'hpMetricTotalAgreements',
        totalAgreements.toLocaleString()
    );

    setMetric(
        'hpMetricOutstanding',
        formatPortfolioMoney(totalOutstanding)
    );

    setMetric(
        'hpMetricOverdue',
        overdueAgreements.toLocaleString()
    );

    setMetric(
        'hpMetricFulfilled',
        fulfilledAgreements.toLocaleString()
    );

    setMetric(
        'hpMetricPortfolioOutstanding',
        formatPortfolioMoney(totalOutstanding)
    );

}
        const query = (search?.value || '').trim().toLowerCase();
// HP — Update dashboard metrics from real Supabase data.
updateHirePurchaseMetrics();
      
        const filtered = agreements
            .map(agreement => getAgreementView(agreement))
            .filter(item => {

                const matchesStatus =
                    currentFilter === 'all' ||
                    item.status === currentFilter;

                const matchesSearch = [
                    item.id,
                    item.name,
                    item.phone,
                    item.product
                ].some(value =>
                    String(value || '').toLowerCase().includes(query)
                );

                return matchesStatus && matchesSearch;
            });


/* HP — Update filter counts from real agreements */

const statusCounts = {
    all: agreements.length,
    incoming: 0,
    overdue: 0,
    active: 0,
    fulfilled: 0
};

agreements.forEach(agreement => {

    const status =
        getAgreementView(agreement).status;

    if (
        Object.prototype.hasOwnProperty.call(
            statusCounts,
            status
        )
    ) {

        statusCounts[status]++;

    }

});

document.querySelectorAll(
    '[data-hp-count]'
).forEach(element => {

    const filter =
        element.dataset.hpCount;

    if (
        Object.prototype.hasOwnProperty.call(
            statusCounts,
            filter
        )
    ) {

        element.textContent =
            statusCounts[filter].toLocaleString();

    }

});

      
        if (count) {
            count.textContent =
                `${filtered.length} agreement` +
                `${filtered.length === 1 ? '' : 's'}`;
        }

        if (!filtered.length) {
            list.innerHTML = `
                <div class="hp-empty-state">
                    <i class="fa-solid fa-folder-open"></i>
                    <strong>No matching agreements</strong>
                    <p>Try another category or search term.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = filtered.map(item => {

            const progress = item.total > 0
                ? Math.min(
                    100,
                    Math.round((item.paid / item.total) * 100)
                )
                : 0;

            const statusLabel =
                statusLabels[item.status] || 'Active';

            const isFulfilled = item.status === 'fulfilled';

            return `
                <article class="hp-agreement-card">

                    <div class="hp-agreement-top">
                        <span class="hp-agreement-id">
                            ${escapeHTML(item.id)}
                        </span>

                        <span class="hp-status hp-status-${item.status}">
                            ${statusLabel}
                        </span>
                    </div>

                    <div class="hp-customer-row">

                        <div class="hp-customer-avatar">
                            ${escapeHTML(
                                item.name
                                    .split(/\s+/)
                                    .map(word => word[0] || '')
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()
                            )}
                        </div>

                        <div class="hp-customer-info">
                            <strong>${escapeHTML(item.name)}</strong>
                            <span>${escapeHTML(item.phone)}</span>
                        </div>

                    </div>

                    <p class="hp-product-name">
                        <i class="fa-solid fa-box"></i>
                        &nbsp;${escapeHTML(item.product)}
                    </p>

                    <div class="hp-balance-row">
                        <span>Outstanding balance</span>
                        <strong>${money(item.balance)}</strong>
                    </div>

                    <div class="hp-progress-track">
                        <div
                            class="hp-progress-fill ${
                                progress === 100 ? 'is-complete' : ''
                            }"
                            style="width:${progress}%"
                        ></div>
                    </div>

                    <div class="hp-progress-caption">
                        <span>${money(item.paid)} paid</span>
                        <span>${progress}% complete</span>
                    </div>

                    <div class="hp-agreement-divider"></div>

                    <div class="hp-agreement-footer">

                        <div class="hp-next-payment">
                            <span>${
                                isFulfilled
                                    ? 'Agreement status'
                                    : 'Next installment'
                            }</span>

                            <strong>${
                                isFulfilled
                                    ? 'Fully paid'
                                    : `${money(item.nextAmount)} · ${dateLabel(item.nextDate)}`
                            }</strong>
                        </div>

                        <button
                            type="button"
                            class="hp-view-btn"
                            data-hp-view="${escapeHTML(item.id)}"
                        >
                            View details
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>

                    </div>

                </article>
            `;
        }).join('');
    }

    // -----------------------------------------
    // OPEN DASHBOARD
    // -----------------------------------------

    function openDashboard() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        dashboard.hidden = false;
        dashboard.classList.add('active');
        dashboard.scrollTop = 0;

        window.scrollTo({ top: 0, behavior: 'auto' });

        if (typeof screenTitle !== 'undefined' && screenTitle) {
            screenTitle.textContent = 'Hire Purchase';
        }

        loadAgreements();
    }

    function closeDashboard() {
        dashboard.classList.remove('active');
        dashboard.hidden = true;

        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const sellScreen = document.getElementById('sellScreen');

        if (sellScreen) {
            sellScreen.classList.add('active');
        }

        if (typeof screenTitle !== 'undefined' && screenTitle) {
            screenTitle.textContent = 'Sell';
        }
    }

    // -----------------------------------------
    // BUTTONS AND FILTERS
    // -----------------------------------------

    openButton.addEventListener('click', openDashboard);

    backButton?.addEventListener('click', closeDashboard);

    search?.addEventListener('input', renderAgreements);

    filterButtons.forEach(button => {

        button.addEventListener('click', () => {

            currentFilter = button.dataset.hpFilter || 'all';

            filterButtons.forEach(item => {
                item.classList.toggle(
                    'is-active',
                    item === button
                );
            });

            renderAgreements();
        });

    });

    // -----------------------------------------
    // VIEW DETAILS + RETRY
    // -----------------------------------------

    list.addEventListener('click', event => {

        const retryButton = event.target.closest('[data-hp-retry]');

        if (retryButton) {
            loadAgreements();
            return;
        }

        const button = event.target.closest('[data-hp-view]');

        if (!button) return;

        const agreement = agreements.find(
            item => item.id === button.dataset.hpView
        );

        if (!agreement) return;

        const view = getAgreementView(agreement);

        const installmentDetails = [...agreement.installments]
            .sort(
                (a, b) =>
                    Number(a.installment_number) -
                    Number(b.installment_number)
            )
            .map(item => {

                const status =
                    Number(item.outstanding_amount || 0) <= 0
                        ? 'Paid'
                        : item.status || 'Pending';

                return (
                    `#${item.installment_number} | ` +
                    `${dateLabel(item.due_date)} | ` +
                    `${money(item.scheduled_amount)} | ` +
                    `Paid: ${money(item.amount_paid)} | ` +
                    `Balance: ${money(item.outstanding_amount)} | ` +
                    `${status}`
                );
            })
            .join('\n');

        alert(
            `HIRE PURCHASE AGREEMENT\n\n` +
            `Customer: ${view.name}\n` +
            `Phone: ${view.phone}\n` +
            `Agreement: ${view.id}\n` +
            `Products: ${view.product}\n\n` +
            `Sale total: ${money(agreement.sale_total)}\n` +
            `Deposit: ${money(agreement.deposit_amount)}\n` +
            `Principal: ${money(agreement.principal_amount)}\n` +
            `Fixed charge: ${money(agreement.charge_amount)}\n` +
            `Agreement total: ${money(agreement.agreement_total)}\n\n` +
            `Paid: ${money(view.paid)}\n` +
            `Outstanding: ${money(view.balance)}\n\n` +
            `INSTALLMENTS\n${installmentDetails || 'No installments found'}`
        );

    });

    console.log('HP-2: Supabase dashboard initialized.');

})();


/* =========================================================
   NEXODRA — HELD SALES FLOW (DEMO)
   List -> Resume Details -> Delete Confirmation
   ========================================================= */
(function initHeldSalesFlow() {
    'use strict';

    function startHeldSalesFlow() {
        const listScreen = document.getElementById('heldSalesScreen');
        const resumeScreen = document.getElementById('heldResumeScreen');
        const deleteScreen = document.getElementById('heldDeleteScreen');
        const openButton = document.getElementById('sellScanBtn');

        // Do not run unless the new HTML screens exist.
        if (!listScreen || !resumeScreen || !deleteScreen || !openButton) return;

        const screens = [listScreen, resumeScreen, deleteScreen];

        const money = value => 'UGX ' + Number(value || 0).toLocaleString('en-US');

        const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));


      
        
const HELD_SALES_STORAGE_KEY = 'nexodra_held_sales';

function loadHeldSales() {
    try {
        const saved = localStorage.getItem(HELD_SALES_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Could not read held sales:', error);
        return [];
    }
}

function saveHeldSales() {
    localStorage.setItem(
        HELD_SALES_STORAGE_KEY,
        JSON.stringify(heldSalesDemo)
    );
}

let heldSalesDemo = loadHeldSales();
      
        let currentSaleId = null;
        let activeFilter = 'all';
        let searchText = '';


    
/* =========================================
   HOLD CURRENT POS SALE
   Uses the actual POS cart and Held Sales data
========================================= */

const holdSaleButton = document.getElementById('holdSaleBtn');

if (holdSaleButton) {

    holdSaleButton.addEventListener('click', function () {

        // Use the actual POS cart.
        if (!Array.isArray(currentSaleItems) || currentSaleItems.length === 0) {
            alert('There are no products in the current sale to hold.');
            return;
        }

        const now = new Date();

        // Convert POS cart items into the format Held Sales expects.
        const items = currentSaleItems.map(item => ({
            productId: item.productId,
            name: item.title || 'Product',
            title: item.title || 'Product',
            price: Number(item.price) || 0,
            image: item.image || '',
            icon: 'fa-box',
            emoji: item.emoji || '📦',
            quantity: Number(item.quantity) || 1
        }));

        const subtotal = items.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        const discount = Number(sellDiscountAmount) || 0;
        const tax = Number(sellTaxAmount) || 0;

        // Build a complete Held Sale record.
        const heldSale = {
            id: 'HOLD-' + now.getTime(),
            customer: 'Walk-in Customer',
            createdAt: now.toISOString(),
            savedLabel: now.toLocaleString(),
            dateGroup: 'today',
            items: items,
            subtotal: subtotal,
            discount: discount,
            tax: tax,
            status: 'Saved'
        };

        // Add to the SAME in-memory array used by Held Sales.
        heldSalesDemo.unshift(heldSale);

        // Save the complete array.
        try {
            saveHeldSales();
        } catch (error) {

            // Undo the in-memory addition if saving failed.
            heldSalesDemo.shift();

            console.error('Could not save held sale:', error);
            alert('Could not save the sale. Your current sale is unchanged.');
            return;
        }

        // Clear the real POS cart only after successful save.
        currentSaleItems.length = 0;

        sellDiscountAmount = 0;
        sellTaxAmount = 0;

        // Refresh the actual POS panel.
        renderSellCart();
        updateSellTotals();
        renderSellProducts();

        // Notify other app components.
        document.dispatchEvent(
            new CustomEvent('sell:cart-cleared')
        );

        // Refresh Held Sales immediately.
        renderList();

        alert('Sale held successfully.');

    });

}

        


      
        function getSale(id) {
            return heldSalesDemo.find(sale => sale.id === String(id));
        }

        function getSubtotal(sale) {
            return sale.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        }

        function getTotal(sale) {
            return Math.max(0, getSubtotal(sale) - sale.discount + sale.tax);
        }

        function getUnits(sale) {
            return sale.items.reduce((sum, item) => sum + item.quantity, 0);
        }

        function initials(name) {
            return String(name)
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(part => part[0].toUpperCase())
                .join('');
        }

        function showScreen(target) {
    screens.forEach(screen => {
        screen.classList.remove('active');
        screen.hidden = screen !== target;
    });

    target.hidden = false;
    target.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'auto' });
}


      
        function showList() {
            showScreen(listScreen);
            renderList();
        }

        function openResume(id) {
            const sale = getSale(id);
            if (!sale) return;

            currentSaleId = sale.id;

            document.getElementById('heldResumeAvatar').textContent = initials(sale.customer);
            document.getElementById('heldResumeCustomer').textContent = sale.customer;
            document.getElementById('heldResumeMeta').textContent =
                'Sale #' + sale.id + ' · ' + sale.savedLabel;
            document.getElementById('heldResumeItemCount').textContent =
                sale.items.length + (sale.items.length === 1 ? ' item' : ' items');
            document.getElementById('heldResumeUnits').textContent =
                getUnits(sale) + (getUnits(sale) === 1 ? ' unit' : ' units');

            document.getElementById('heldResumeItems').innerHTML = sale.items.map(item => `
                <article class="held-resume-item">
                    <div class="held-product-placeholder">
                        <i class="fa-solid ${escapeHTML(item.icon)}"></i>
                    </div>
                    <div class="held-resume-item-info">
                        <h3>${escapeHTML(item.name)}</h3>
                        <p>${item.quantity} × ${money(item.price)}</p>
                    </div>
                    <div class="held-resume-item-price">
                        ${money(item.quantity * item.price)}
                    </div>
                </article>
            `).join('');

            document.getElementById('heldResumeSubtotal').textContent = money(getSubtotal(sale));
            document.getElementById('heldResumeDiscount').textContent = money(sale.discount);
            document.getElementById('heldResumeTax').textContent = money(sale.tax);
            document.getElementById('heldResumeTotal').textContent = money(getTotal(sale));

            showScreen(resumeScreen);
        }

        function openDelete(id) {
            const sale = getSale(id);
            if (!sale) return;

            currentSaleId = sale.id;

            document.getElementById('heldDeleteAvatar').textContent = initials(sale.customer);
            document.getElementById('heldDeleteCustomer').textContent = sale.customer;
            document.getElementById('heldDeleteMeta').textContent =
                'Sale #' + sale.id + ' · ' +
                sale.items.length + (sale.items.length === 1 ? ' item' : ' items');
            document.getElementById('heldDeleteAmount').textContent = money(getTotal(sale));

            showScreen(deleteScreen);
        }

        function renderList() {
            const list = document.getElementById('heldSalesList');
            const empty = document.getElementById('heldEmptyState');
            const count = document.getElementById('heldCount');
            const totalValue = document.getElementById('heldTotalValue');
            const subtitle = document.getElementById('heldListSubtitle');
            const allCount = document.getElementById('heldFilterAllCount');
            const clearButton = document.getElementById('heldClearSearch');

            if (!list || !empty) return;

            const filtered = heldSalesDemo.filter(sale => {
                const matchesFilter =
                    activeFilter === 'all' ||
                    (activeFilter === 'today' && sale.dateGroup === 'today') ||
                    (activeFilter === 'week' && sale.dateGroup === 'week') ||
                    (activeFilter === 'older' && sale.dateGroup === 'older');

                const haystack = (sale.id + ' ' + sale.customer + ' ' +
                    sale.items.map(item => item.name).join(' ')).toLowerCase();

                return matchesFilter && haystack.includes(searchText.toLowerCase());
            });

            count.textContent = heldSalesDemo.length;
            allCount.textContent = heldSalesDemo.length;
            totalValue.textContent = money(heldSalesDemo.reduce((sum, sale) => sum + getTotal(sale), 0));
            subtitle.textContent = filtered.length +
                (filtered.length === 1 ? ' sale found' : ' sales found');
            clearButton.hidden = !searchText;

            document.querySelectorAll('[data-held-filter]').forEach(button => {
                button.classList.toggle('active', button.dataset.heldFilter === activeFilter);
            });

            list.innerHTML = filtered.map(sale => `
                <article class="held-sale-card">
                    <div class="held-sale-top">
                        <div class="held-sale-main">
                            <span class="held-sale-number">SALE #${escapeHTML(sale.id)}</span>
                            <h3 class="held-sale-customer">${escapeHTML(sale.customer)}</h3>
                            <p class="held-sale-time">
                                <i class="fa-regular fa-clock"></i>
                                ${escapeHTML(sale.savedLabel)}
                            </p>
                            <span class="held-sale-status ${sale.customer === 'Walk-in Customer' ? 'walkin' : ''}">
                                <i class="fa-solid fa-check"></i> ${escapeHTML(sale.status)}
                            </span>
                        </div>
                        <div class="held-sale-value">${money(getTotal(sale))}</div>
                    </div>

                    <div class="held-sale-meta">
                        <span><i class="fa-solid fa-cube"></i>
                            ${sale.items.length} ${sale.items.length === 1 ? 'item' : 'items'}
                        </span>
                        <span><i class="fa-solid fa-layer-group"></i>
                            ${getUnits(sale)} ${getUnits(sale) === 1 ? 'unit' : 'units'}
                        </span>
                    </div>

                    <div class="held-sale-actions">
                        <button type="button" class="held-primary-btn" data-held-resume="${escapeHTML(sale.id)}">
                            <i class="fa-solid fa-play"></i> Resume
                        </button>
                        <button type="button" class="held-secondary-btn" data-held-delete="${escapeHTML(sale.id)}">
                            <i class="fa-regular fa-trash-can"></i> Delete
                        </button>
                    </div>
                </article>
            `).join('');

            empty.hidden = filtered.length > 0;
            list.hidden = filtered.length === 0;
        }

        // Open list using the existing Held Sales button.
        openButton.addEventListener('click', function (event) {
            event.preventDefault();
            showList();
        });

        // Event delegation for dynamically rendered sale cards.
        document.getElementById('heldSalesList').addEventListener('click', function (event) {
            const resumeButton = event.target.closest('[data-held-resume]');
            const deleteButton = event.target.closest('[data-held-delete]');

            if (resumeButton) openResume(resumeButton.dataset.heldResume);
            if (deleteButton) openDelete(deleteButton.dataset.heldDelete);
        });

        // Search.
        document.getElementById('heldSearchInput').addEventListener('input', function () {
            searchText = this.value.trim();
            renderList();
        });

        document.getElementById('heldClearSearch').addEventListener('click', function () {
            searchText = '';
            document.getElementById('heldSearchInput').value = '';
            renderList();
            document.getElementById('heldSearchInput').focus();
        });

        // Date filters.
        document.querySelectorAll('[data-held-filter]').forEach(button => {
            button.addEventListener('click', function () {
                activeFilter = this.dataset.heldFilter;
                renderList();
            });
        });

        document.getElementById('heldResetFilters').addEventListener('click', function () {
            activeFilter = 'all';
            searchText = '';
            document.getElementById('heldSearchInput').value = '';
            renderList();
        });

        // Return to the held-sales list.
        document.getElementById('heldBackBtn').addEventListener('click', function () {
            showScreen(document.getElementById('sellScreen') || listScreen);
        });

        document.getElementById('heldResumeBackBtn').addEventListener('click', showList);
        document.getElementById('heldResumeCancelBtn').addEventListener('click', showList);
        document.getElementById('heldDeleteBackBtn').addEventListener('click', showList);
        document.getElementById('heldCancelDeleteBtn').addEventListener('click', showList);

        
        // Confirm resume: restore the held sale into the real POS cart.
        document.getElementById('heldConfirmResumeBtn').addEventListener('click', function () {

            const sale = getSale(currentSaleId);

            if (!sale || !Array.isArray(sale.items) || sale.items.length === 0) {
                alert('This held sale has no products to resume.');
                return;
            }

            // Clear the current POS cart before restoring the held sale.
            currentSaleItems.length = 0;

            // Restore held products into the actual POS cart structure.
            sale.items.forEach(item => {

                currentSaleItems.push({

                    productId: item.productId,

                    title: item.title || item.name || 'Product',

                    price: Number(item.price) || 0,

                    image: item.image || '',

                    emoji: item.emoji || '📦',

                    quantity: Number(item.quantity) || 1

                });

            });

            // Restore discount and tax.
            sellDiscountAmount = Number(sale.discount) || 0;
            sellTaxAmount = Number(sale.tax) || 0;

            // Remove the sale from Held Sales after restoring it.
            const index = heldSalesDemo.findIndex(
                held => held.id === sale.id
            );

            if (index !== -1) {
                heldSalesDemo.splice(index, 1);
            }

            // Save the updated Held Sales list.
            try {
                saveHeldSales();
            } catch (error) {

                console.error('Could not update Held Sales:', error);

                alert('The sale was restored, but Held Sales could not be updated.');
            }

            // Refresh the actual POS cart and totals.
            renderSellCart();
            updateSellTotals();
            renderSellProducts();

            // Notify other app components.
            window.dispatchEvent(new CustomEvent('heldsale:resume', {
                detail: JSON.parse(JSON.stringify(sale))
            }));

            // Return to the POS screen.
            const posScreen = document.getElementById('sellScreen');

            if (posScreen) {
                showScreen(posScreen);
            } else {
                showList();
            }

            // Clear the selected held sale.
            currentSaleId = null;

        });


        // Confirm deletion: remove only after explicit confirmation.
        document.getElementById('heldConfirmDeleteBtn').addEventListener('click', function () {
            const index = heldSalesDemo.findIndex(sale => sale.id === currentSaleId);
            if (index < 0) return;

            const deletedSale = heldSalesDemo[index];
            heldSalesDemo.splice(index, 1);

          saveHeldSales();

            window.dispatchEvent(new CustomEvent('heldsale:delete', {
                detail: { id: deletedSale.id, sale: deletedSale }
            }));

            currentSaleId = null;
            showList();
        });

        // Initial state: new screens are hidden until the Held Sales button is pressed.
        screens.forEach(screen => {
            screen.classList.remove('active');
            screen.hidden = true;
        });

        renderList();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startHeldSalesFlow, { once: true });
    } else {
        startHeldSalesFlow();
    }
})();


/* =========================================
   NEXODRA — SEARCHABLE COUNTRY PICKER
   Uses the existing signupCountry select
========================================= */

(function nexodraSearchableCountryPicker() {
    'use strict';

    function initializeCountryPicker() {
        const trigger = document.getElementById('signupCountryTrigger');
        const label = document.getElementById('signupCountryLabel');
        const select = document.getElementById('signupCountry');
        const dialog = document.getElementById('signupCountryDialog');
        const closeButton = document.getElementById('signupCountryClose');
        const searchInput = document.getElementById('signupCountrySearch');
        const countryList = document.getElementById('signupCountryList');
        const emptyMessage = document.getElementById('signupCountryEmpty');

        // Safely do nothing if this form is not on the current page.
        if (
            !trigger ||
            !label ||
            !select ||
            !dialog ||
            !closeButton ||
            !searchInput ||
            !countryList ||
            !emptyMessage
        ) {
            return;
        }

        // Prevent duplicate event listeners if initialization runs again.
        if (trigger.dataset.countryPickerInitialized === 'true') {
            return;
        }
        trigger.dataset.countryPickerInitialized = 'true';

        const originalOptions = Array.from(select.options)
            .filter(option => option.value.trim() !== '')
            .map(option => ({
                code: option.value.trim(),
                name: option.textContent.trim()
            }));

        let previouslyFocusedElement = null;

        function normalize(value) {
            return String(value || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLocaleLowerCase()
                .trim();
        }

        function updateLabel() {
            const selectedOption = select.options[select.selectedIndex];

            label.textContent =
                selectedOption && selectedOption.value
                    ? selectedOption.textContent.trim()
                    : 'Select your country';

            trigger.setAttribute(
                'aria-label',
                selectedOption && selectedOption.value
                    ? 'Country of operation: ' +
                      selectedOption.textContent.trim() +
                      '. Change country'
                    : 'Select your country'
            );
        }

        function renderCountries(query) {
            const searchTerm = normalize(query);

            const matches = originalOptions.filter(country => {
                return (
                    normalize(country.name).includes(searchTerm) ||
                    normalize(country.code).includes(searchTerm)
                );
            });

            const fragment = document.createDocumentFragment();

            matches.forEach(country => {
                const optionButton = document.createElement('button');
                optionButton.type = 'button';
                optionButton.className = 'nexodra-country-option';
                optionButton.setAttribute('role', 'option');
                optionButton.setAttribute(
                    'aria-selected',
                    select.value === country.code ? 'true' : 'false'
                );

                const codeSpan = document.createElement('span');
                codeSpan.className = 'nexodra-country-option-code';
                codeSpan.textContent = country.code;

                const nameSpan = document.createElement('span');
                nameSpan.className = 'nexodra-country-option-name';
                nameSpan.textContent = country.name;

                optionButton.append(codeSpan, nameSpan);

                optionButton.addEventListener('click', () => {
                    select.value = country.code;

                    // Notify any existing code listening to the select.
                    select.dispatchEvent(
                        new Event('input', { bubbles: true })
                    );
                    select.dispatchEvent(
                        new Event('change', { bubbles: true })
                    );

                    updateLabel();
                    closePicker();
                    trigger.focus();
                });

                fragment.appendChild(optionButton);
            });

            countryList.replaceChildren(fragment);
            emptyMessage.hidden = matches.length !== 0;
        }

        function openPicker() {
            previouslyFocusedElement = document.activeElement;

            dialog.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');

            searchInput.value = '';
            renderCountries('');

            searchInput.focus();
        }

        function closePicker() {
            dialog.hidden = true;
            trigger.setAttribute('aria-expanded', 'false');
        }

        trigger.addEventListener('click', () => {
            if (dialog.hidden) {
                openPicker();
            } else {
                closePicker();
            }
        });

        closeButton.addEventListener('click', () => {
            closePicker();
            trigger.focus();
        });

        searchInput.addEventListener('input', () => {
            renderCountries(searchInput.value);
        });

        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closePicker();
                trigger.focus();
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();

                const firstOption =
                    countryList.querySelector('.nexodra-country-option');

                if (firstOption) {
                    firstOption.focus();
                }
            }
        });

        countryList.addEventListener('keydown', event => {
            const options = Array.from(
                countryList.querySelectorAll('.nexodra-country-option')
            );

            const currentIndex = options.indexOf(document.activeElement);

            if (event.key === 'Escape') {
                event.preventDefault();
                closePicker();
                trigger.focus();
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();

                if (options.length) {
                    options[Math.min(currentIndex + 1, options.length - 1)]
                        .focus();
                }
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();

                if (currentIndex <= 0) {
                    searchInput.focus();
                } else {
                    options[currentIndex - 1].focus();
                }
            }
        });

        document.addEventListener('click', event => {
            if (
                !dialog.hidden &&
                !dialog.contains(event.target) &&
                !trigger.contains(event.target)
            ) {
                closePicker();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !dialog.hidden) {
                closePicker();
                trigger.focus();
            }
        });

        select.addEventListener('change', () => {
            updateLabel();

            if (!dialog.hidden) {
                renderCountries(searchInput.value);
            }
        });

        // Keep the visible label in sync if the signup form is reset.
        const signupForm = document.getElementById('signupForm');

        if (signupForm) {
            signupForm.addEventListener('reset', () => {
                window.setTimeout(() => {
                    updateLabel();
                    searchInput.value = '';
                    renderCountries('');
                    closePicker();
                }, 0);
            });
        }

        updateLabel();
        renderCountries('');

        console.log(
            'NEXODRA — Searchable country picker initialized with ' +
            originalOptions.length +
            ' country options.'
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initializeCountryPicker,
            { once: true }
        );
    } else {
        initializeCountryPicker();
    }
})();




/* =========================================
   NEXODRA — INLINE SALE DISCOUNT
   Connects Confirm to the actual POS total
========================================= */

(function initSellDiscountUI() {
    'use strict';

    const actionsRow = document.getElementById('sellActionsRow');
    const discountButton = document.getElementById('sellDiscountBtn');
    const inputWrap = document.getElementById('sellDiscountInputWrap');
    const discountInput = document.getElementById('sellDiscountInput');
    const controls = document.getElementById('sellDiscountControls');
    const cancelButton = document.getElementById('sellDiscountCancelBtn');
    const confirmButton = document.getElementById('sellDiscountConfirmBtn');

    if (
        !actionsRow ||
        !discountButton ||
        !inputWrap ||
        !discountInput ||
        !controls ||
        !cancelButton ||
        !confirmButton
    ) {
        console.warn(
            'Discount setup failed: one or more discount HTML elements are missing.'
        );
        return;
    }

    // Keep the normal Discount / Note / Hold actions at startup.
    actionsRow.classList.remove('discount-open');
    inputWrap.hidden = true;
    controls.hidden = true;
    discountButton.setAttribute('aria-expanded', 'false');

    // Use the existing POS discount variable.
    // This is the value updateSellTotals() and checkout already use.
    let appliedDiscount = Number(sellDiscountAmount || 0);

    function getCurrentSaleSubtotal() {
        return (currentSaleItems || []).reduce((sum, item) => {
            return sum +
                (Number(item.price) || 0) *
                (Number(item.quantity) || 0);
        }, 0);
    }

    function openDiscountEditor() {
        discountInput.value = appliedDiscount > 0
            ? appliedDiscount.toFixed(2)
            : '';

        actionsRow.classList.add('discount-open');
        inputWrap.hidden = false;
        controls.hidden = false;

        discountButton.setAttribute('aria-expanded', 'true');
        discountInput.focus();
    }

    function closeDiscountEditor() {
        actionsRow.classList.remove('discount-open');
        inputWrap.hidden = true;
        controls.hidden = true;

        discountButton.setAttribute('aria-expanded', 'false');
    }

    function cancelDiscount() {
        // Do not change the already-applied discount.
        discountInput.value = appliedDiscount > 0
            ? appliedDiscount.toFixed(2)
            : '';

        closeDiscountEditor();
    }

    function confirmDiscount() {
        const rawValue = discountInput.value.trim();

        // Require an amount rather than treating an empty field as zero.
        if (rawValue === '') {
            alert('Please enter a discount amount.');
            discountInput.focus();
            return;
        }

        const enteredValue = Number(rawValue);

        if (!Number.isFinite(enteredValue) || enteredValue < 0) {
            alert('Enter a valid discount amount of zero or more.');
            discountInput.focus();
            return;
        }

        // The discount is a fixed amount, not a percentage.
        const subtotal = getCurrentSaleSubtotal();

        if (enteredValue > subtotal) {
            alert(
                'The discount cannot be greater than the current sale subtotal.'
            );
            discountInput.focus();
            return;
        }

        // Save to the POS variable used by the existing totals and checkout.
        appliedDiscount = Math.round(enteredValue * 100) / 100;
        sellDiscountAmount = appliedDiscount;

        // Keep the current UI's discount value in sync.
        actionsRow.dataset.discountAmount = String(appliedDiscount);

        // Immediately recalculate the displayed subtotal, discount and total.
        if (typeof updateSellTotals === 'function') {
            updateSellTotals();
        }

        // Notify any other code that listens for discount changes.
        document.dispatchEvent(
            new CustomEvent('sell:discount-applied', {
                detail: {
                    amount: appliedDiscount
                }
            })
        );

        closeDiscountEditor();

        console.log('POS discount applied:', {
            subtotal: subtotal,
            discount: appliedDiscount,
            totalAfterDiscount: Math.max(0, subtotal - appliedDiscount)
        });
    }

    discountButton.addEventListener('click', openDiscountEditor);
    cancelButton.addEventListener('click', cancelDiscount);
    confirmButton.addEventListener('click', confirmDiscount);

    // Allow Enter to confirm while the discount input is focused.
    discountInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            confirmDiscount();
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            cancelDiscount();
        }
    });

    // Make the current confirmed value accessible to other code if needed.
    window.getSellDiscountAmount = function () {
        return appliedDiscount;
    };

    // Reset the discount when the sale-reset event is dispatched.
    document.addEventListener('sell:reset', function () {
        appliedDiscount = 0;
        sellDiscountAmount = 0;

        discountInput.value = '';
        actionsRow.dataset.discountAmount = '0';

        closeDiscountEditor();

        if (typeof updateSellTotals === 'function') {
            updateSellTotals();
        }
    });

    console.log('NEXODRA — POS discount initialized.');
})();


/* =========================================
   NEXODRA CHAT INBOX — UI FILTERS
   Does not replace existing chat functions.
========================================= */

(function initNexodraChatInboxUI() {

    'use strict';

    const inboxScreen =
        document.getElementById('inboxScreen');

    if (!inboxScreen) {
        return;
    }

    const searchInput =
        document.getElementById('inboxChatSearch');

    const searchClear =
        document.getElementById('inboxChatSearchClear');

    const filterButtons =
        inboxScreen.querySelectorAll(
            '[data-chat-filter]'
        );

    const chatList =
        document.getElementById('notificationList');

    let activeFilter = 'all';


    // -----------------------------------------
    // FIND ACTUAL CHAT ROWS
    // -----------------------------------------

    function getChatRows() {

        if (!chatList) {
            return [];
        }

        return Array.from(
            chatList.querySelectorAll(
                '[data-chat-id], ' +
                '[data-conversation-id], ' +
                '.chat-list-item, ' +
                '.conversation-item'
            )
        );

    }


    // -----------------------------------------
    // CHAT FILTER MATCH
    // -----------------------------------------

    function matchesChatFilter(row, filter) {

        if (filter === 'all') {
            return true;
        }

        if (filter === 'primary') {

            return (
                row.dataset.chatCategory === 'primary' ||
                row.dataset.category === 'primary'
            );

        }

        if (filter === 'groups') {

            return (
                row.dataset.chatType === 'group' ||
                row.dataset.type === 'group' ||
                row.classList.contains('is-group')
            );

        }

        if (filter === 'favorites') {

            return (
                row.dataset.favorite === 'true' ||
                row.dataset.isFavorite === 'true' ||
                row.classList.contains('is-favorite')
            );

        }

        if (filter === 'requests') {

            return (
                row.dataset.chatCategory === 'requests' ||
                row.dataset.category === 'requests' ||
                row.dataset.chatType === 'request'
            );

        }

        return true;

    }


    // -----------------------------------------
    // SEARCH MATCH
    // -----------------------------------------

    function matchesChatSearch(row, query) {

        if (!query) {
            return true;
        }

        const searchableText =
            row.textContent || '';

        return searchableText
            .toLowerCase()
            .includes(query);

    }


    // -----------------------------------------
    // APPLY FILTER + SEARCH
    // -----------------------------------------

    function applyChatFilters() {

        const query =
            (searchInput?.value || '')
                .trim()
                .toLowerCase();

        const rows =
            getChatRows();

        rows.forEach(row => {

            const matchesFilter =
                matchesChatFilter(
                    row,
                    activeFilter
                );

            const matchesSearch =
                matchesChatSearch(
                    row,
                    query
                );

            row.hidden =
                !(matchesFilter && matchesSearch);

        });

        if (searchClear) {

            searchClear.hidden =
                !searchInput?.value;

        }

    }


    // -----------------------------------------
    // FILTER BUTTONS
    // -----------------------------------------

    filterButtons.forEach(button => {

        button.addEventListener(
            'click',
            function () {

                activeFilter =
                    button.dataset.chatFilter || 'all';

                filterButtons.forEach(tab => {

                    const isActive =
                        tab === button;

                    tab.classList.toggle(
                        'active',
                        isActive
                    );

                    tab.setAttribute(
                        'aria-pressed',
                        String(isActive)
                    );

                });

                applyChatFilters();

            }
        );

    });


    // -----------------------------------------
    // SEARCH INPUT
    // -----------------------------------------

    if (searchInput) {

        searchInput.addEventListener(
            'input',
            applyChatFilters
        );

    }


    // -----------------------------------------
    // CLEAR SEARCH
    // -----------------------------------------

    if (searchClear) {

        searchClear.addEventListener(
            'click',
            function () {

                if (searchInput) {

                    searchInput.value = '';

                    searchInput.focus();

                }

                applyChatFilters();

            }
        );

    }


    // -----------------------------------------
    // CHAT LIST UPDATES
    // -----------------------------------------

    if (chatList) {

        const observer =
            new MutationObserver(function () {

                applyChatFilters();

            });

        observer.observe(
            chatList,
            {
                childList: true,
                subtree: true
            }
        );

    }


    // -----------------------------------------
    // COMPOSE BUTTON BRIDGE
    // -----------------------------------------

    function openExistingCompose() {

        /*
         * Existing compose/new chat functionality
         * should be triggered here.
         *
         * This bridge intentionally does not
         * invent a new chat creation function.
         */

        inboxScreen.dispatchEvent(
            new CustomEvent(
                'nexodra:compose-chat',
                {
                    bubbles: true
                }
            )
        );

    }


    const composeButton =
        document.getElementById(
            'inboxComposeBtn'
        );

    const floatingComposeButton =
        document.getElementById(
            'inboxFloatingComposeBtn'
        );

    if (composeButton) {

        composeButton.addEventListener(
            'click',
            openExistingCompose
        );

    }

    if (floatingComposeButton) {

        floatingComposeButton.addEventListener(
            'click',
            openExistingCompose
        );

    }


    // -----------------------------------------
    // VIDEO CALL BRIDGE
    // -----------------------------------------

    const videoCallButton =
        document.getElementById(
            'inboxVideoCallBtn'
        );

    if (videoCallButton) {

        videoCallButton.addEventListener(
            'click',
            function () {

                inboxScreen.dispatchEvent(
                    new CustomEvent(
                        'nexodra:video-call',
                        {
                            bubbles: true
                        }
                    )
                );

            }
        );

    }


    // -----------------------------------------
    // INITIAL FILTER
    // -----------------------------------------

    applyChatFilters();

})();
