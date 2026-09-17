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
                            €${price.toFixed(2)}
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
        'BRICK SELL 2 — Products rendered:',
        visibleProducts
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
                            €${Number(item.price).toFixed(2)}
                            ×
                            ${item.quantity}
                        </small>

                    </div>


                    <strong class="sell-cart-item-total">

                        €${lineTotal.toFixed(2)}

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
            `€${subtotal.toFixed(2)}`;

    }


    // =====================================
    // UPDATE DISCOUNT
    // =====================================

    if (sellDiscount) {

        sellDiscount.textContent =
            `€${discount.toFixed(2)}`;

    }


    // =====================================
    // UPDATE TAX
    // =====================================

    if (sellTax) {

        sellTax.textContent =
            `€${tax.toFixed(2)}`;

    }


    // =====================================
    // UPDATE GRAND TOTAL
    // =====================================

    if (sellGrandTotal) {

        sellGrandTotal.textContent =
            `€${grandTotal.toFixed(2)}`;

    }


    // =====================================
    // UPDATE PAY BUTTON
    // =====================================

    if (sellPayAmount) {

        sellPayAmount.textContent =
            `€${grandTotal.toFixed(2)}`;

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
                    `Total: €${grandTotal.toFixed(2)}`
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
            `A sale of €${Number(grandTotal).toFixed(2)} was completed successfully.`,

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
                    `Revenue: €${grandTotal.toFixed(2)}`
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


// =========================================
// GLOBAL SALES DATA LOADER
// =========================================

async function loadSellerSales(period = 'month') {

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            'SALES LOADER — User not found:',
            userError
        );

        return [];

    }


    let startDate;

    const now = new Date();


    if (period === 'today') {

        startDate = new Date();

        startDate.setHours(
            0,
            0,
            0,
            0
        );


    } else if (period === 'week') {

        startDate = new Date();

        startDate.setDate(
            now.getDate() - 7
        );


    } else {

        // Month

        startDate =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from('sales')
            .select(
                `
                id,
                items_count,
                total,
                created_at
                `
            )
            .eq(
                'owner_id',
                user.id
            )
            .gte(
                'created_at',
                startDate.toISOString()
            )
            .order(
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
        'SALES LOADER — Loaded sales:',
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
    // LOAD SAME MONTHLY SALES
    // =====================================

    const sales =
        await loadSellerSales(
            'month'
        );


    console.log(
        'BRICK STORE SALES 1 — Monthly sales loaded:',
        sales
    );


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
        `€${revenue.toFixed(2)}`;


    if (statusElement) {

        if (sales && sales.length > 0) {

            statusElement.textContent =
                `${sales.length} sale${sales.length === 1 ? '' : 's'} this month`;

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
            `€${revenue.toFixed(2)}`;

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
            `€${revenue.toFixed(2)}`;

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
  
console.log(
    'SALES OVERVIEW 4 — ABOUT TO RENDER GRAPH'
);

try {

    console.log(
        'SALES OVERVIEW 4 — CALLING GRAPH FUNCTION'
    );

    renderSalesGraph(sales);

    console.log(
        'SALES OVERVIEW 4 — GRAPH FUNCTION FINISHED'
    );

} catch (error) {

    console.error(
        'SALES OVERVIEW 4 — GRAPH FUNCTION ERROR:',
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

                        €${saleTotal.toFixed(2)}

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
    // LINE POINTS
    // =====================================

    const linePoints =
        points
            .map(
                point =>
                    `${point.x},${point.y}`
            )
            .join(' ');


    // =====================================
    // AREA UNDER LINE
    // =====================================

    const areaPoints =
        [
            `${points[0].x},${height - paddingBottom}`,
            linePoints,
            `${points[points.length - 1].x},${height - paddingBottom}`
        ].join(' ');


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
                            ${point.label}: €${point.revenue.toFixed(2)}
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

                <polygon
                    points="${areaPoints}"
                    class="sales-graph-area"
                ></polygon>


                <!-- Baseline -->

                <line
                    x1="${paddingLeft}"
                    y1="${height - paddingBottom}"
                    x2="${width - paddingRight}"
                    y2="${height - paddingBottom}"
                    class="sales-graph-baseline"
                ></line>


                <!-- Revenue line -->

                <polyline
                    points="${linePoints}"
                    class="sales-graph-line"
                    fill="none"
                ></polyline>


                <!-- Points -->

                ${circles}


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
        `€${revenue.toFixed(2)}`;


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
// NAVIGATION
// =========================================

navButtons.forEach(button => {

    button.addEventListener('click', () => {

        const targetScreenId =
            button.getAttribute('data-target');

        const newTitle =
            button.getAttribute('data-title');


        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        button.classList.add('active');


        screens.forEach(screen => {
            screen.classList.remove('active');
        });


        const targetScreen =
            document.getElementById(targetScreenId);

        if (targetScreen) {
            targetScreen.classList.add('active');
        }


        if (screenTitle) {
            screenTitle.textContent = newTitle;
        }

    });

});

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


        card.className = 'product-card';


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
                        $${Number(product.price).toFixed(2)}
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
        '$' +
        Number(product.price || 0).toFixed(2);

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
            price > 0
            ? `$${price.toFixed(2)}`
            : '$0.00';

    });

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


const {
    data: savedStore,
    error: storeUpdateError
} = await supabaseClient
    .from('stores')
    .upsert(
        {
            owner_id:
                user.id,

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

  // Remember which user owns this store
     currentStoreOwnerId =
    store.owner_id;

// Use the real store name from Supabase
storeName =
    store.name || '';

  console.log(
    'BRICK 3C — storeName assigned:',
    storeName
);
  
    console.log(
        'BRICK 3C — Store loaded from Supabase:',
        store
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
    filterNotifications(
        window.notifications,
        activeNotificationFilter
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
            'notificationList'
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

let activeNotificationFilter = 'chat';


function filterNotifications(
    notifications,
    filter
) {


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



    if (filter === 'orders') {

        return notifications.filter(
            notification =>
                notification.type === 'order'
        );

    }



    if (filter === 'inventory') {

        return notifications.filter(
            notification =>
                notification.type === 'stock'
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
// INBOX BRICK 2 - CHAT SYSTEM
// =========================================

const chatPanel =
    document.getElementById('chatPanel');

const closeChatBtn =
    document.getElementById('closeChatBtn');

const chatCustomerName =
    document.getElementById('chatCustomerName');

const chatAvatar =
    document.getElementById('chatAvatar');

const chatMessages =
    document.getElementById('chatMessages');

const chatMessageInput =
    document.getElementById('chatMessageInput');

const sendChatMessage =
    document.getElementById('sendChatMessage');


const inboxConversationList =
    document.getElementById('conversationList');


/*
 * Open conversation
 */

if (inboxConversationList) {

    inboxConversationList
        .querySelectorAll('.conversation-card')
        .forEach(card => {

            card.addEventListener('click', () => {

                const name =
                    card.querySelector(
                        '.conversation-top strong'
                    )?.textContent.trim();

                const avatar =
                    card.querySelector(
                        '.conversation-avatar'
                    )?.textContent.trim();

                if (chatCustomerName) {
                    chatCustomerName.textContent =
                        name || 'Customer';
                }

                if (chatAvatar) {
                    chatAvatar.textContent =
                        avatar || '?';
                }

                /*
                 * Hide the inbox list
                 */

                const inboxHeader =
                    document.querySelector(
                        '.inbox-page-header'
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
                    inboxHeader.style.display = 'none';
                }

                if (inboxSearchBox) {
                    inboxSearchBox.style.display = 'none';
                }

                if (inboxFilterBar) {
                    inboxFilterBar.style.display = 'none';
                }

                if (inboxConversationList) {
                    inboxConversationList.style.display =
                        'none';
                }

                /*
                 * Show chat
                 */

                if (chatPanel) {
                    chatPanel.style.display = 'block';
                }

                /*
                 * Remove unread state
                 */

                card.classList.remove('unread');

                const unreadBadge =
                    card.querySelector(
                        '.message-unread-count'
                    );

                if (unreadBadge) {
                    unreadBadge.remove();
                }

            });

        });

}


/*
 * Close conversation
 */

if (closeChatBtn) {

    closeChatBtn.addEventListener('click', () => {

        if (chatPanel) {
            chatPanel.style.display = 'none';
        }

        const inboxHeader =
            document.querySelector(
                '.inbox-page-header'
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
            inboxHeader.style.display = '';
        }

        if (inboxSearchBox) {
            inboxSearchBox.style.display = '';
        }

        if (inboxFilterBar) {
            inboxFilterBar.style.display = '';
        }

        if (inboxConversationList) {
            inboxConversationList.style.display = '';
        }

    });

}


/*
 * Send message
 */

function sendMessage() {

    if (!chatMessageInput || !chatMessages) {
        return;
    }

    const message =
        chatMessageInput.value.trim();

    if (!message) {
        return;
    }

    const messageRow =
        document.createElement('div');

    messageRow.className =
        'message-row er-message';

    messageRow.innerHTML = `
        <div class="message-bubble">
            ${message}
        </div>

        <span class="message-time">
            Just now
        </span>
    `;

    chatMessages.appendChild(messageRow);

    chatMessageInput.value = '';

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


if (sendChatMessage) {

    sendChatMessage.addEventListener(
        'click',
        sendMessage
    );

}


if (chatMessageInput) {

    chatMessageInput.addEventListener(
        'keydown',
        event => {

            if (event.key === 'Enter') {

                event.preventDefault();

                sendMessage();

            }

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

const whatsappShareBtn =
    document.getElementById('whatsappShareBtn');


/*
 * Create the er's public store ID.
 */

let storeName = '';

function getStoreSlug() {

    return storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

}


/*
 * For now this creates the public-store
 * address structure.
 */

function getGeneratedStoreLink() {
    return (
        window.location.origin +
        '/nexodra-seller-app/store/' +
        getStoreSlug()
    );
}


if (shareStoreBtn) {

    shareStoreBtn.addEventListener('click', () => {

        if (storeSharePanel) {
            storeSharePanel.style.display = 'block';
        }

        if (publicStoreLink) {

          console.log(
    'SHARE STORE — Current storeName:',
    storeName
);

console.log(
    'SHARE STORE — Generated slug:',
    getStoreSlug()
);
          
          publicStoreLink.value =
    getGeneratedStoreLink();
          
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
        () => {

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
            // C3-A ENDS HERE
            //
            // C3-B will create the actual
            // Supabase order.
            // =====================================

            setTimeout(() => {

                publicPlaceOrderBtn.disabled =
                    false;

                publicPlaceOrderBtn.innerHTML =
                    publicPlaceOrderBtn.dataset.originalText ||
                    `
                        <i class="fa-solid fa-check"></i>
                        Place Order
                    `;

            }, 800);

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
                    `$${totalPrice.toFixed(2)}`;

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
                '$0.00';

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
                    $${price.toFixed(2)}
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
                    $${lineTotal.toFixed(2)}
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
            '$' + cartTotal.toFixed(2);

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
    // STORE NAME
    // =====================================

    if (name) {

        name.textContent =
            store.name ||
            'My Store';

    }


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


    // Now load this store's published products
    await loadPublicProductsFromSupabase();

}


/*
 * Show seller dashboard again
 */

if (publicBackBtn) {

    publicBackBtn.addEventListener('click', () => {

        publicStore.style.display = 'none';

        sellerDashboard.style.display = '';

    });

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
            'BRICK 3G — Could not load public products:',
            publicProductError
        );

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
                product.title
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
    'public-product-card';

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
            $${Number(product.price || 0).toFixed(2)}
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
            '$' +
            Number(product.price).toFixed(2);

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

let currentStoreProfileImageUrl = '';

let currentStoreCoverImageUrl = '';


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
                    'id, owner_id, name, description, profile_image_url, cover_image_url'
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
                                null

                        })
                        .eq(
                            'owner_id',
                            user.id
                        )
                        .select(
                            'id, owner_id, profile_image_url, cover_image_url'
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
// =========================================

if (
    'serviceWorker' in navigator
) {

    window.addEventListener(
        'load',
        () => {

            navigator.serviceWorker
                .register('./service-worker.js')
                .then(
                    registration => {

                        console.log(
                            'BRICK 1H — Service worker registered successfully:',
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.error(
                            'BRICK 1H — Service worker registration failed:',
                            error
                        );

                    }
                );

        }
    );

}

/* =========================================
   NEXODRA AUTH - BRICK 2A
   CREATE ACCOUNT
========================================= */

document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signupForm');

    const signupName = document.getElementById('signupName');
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
            name: name
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
      


    }

    catch(error) {

        console.error(
            "Unexpected session error:",
            error
        );

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

    const sales =
        await loadSellerSales('month');


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
        'publicMessageBackBtn'
    );


const publicMessageStoreName =
    document.getElementById(
        'publicMessageStoreName'
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

            if (publicMessageStoreName) {

                publicMessageStoreName.textContent =
                    storeName ||
                    'Store';

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
                                €${price.toFixed(2)}
                                ·
                                Qty ${quantity}
                            </span>

                        </div>


                        <div class="live-sale-item-total">

                            <strong>
                                €${total.toFixed(2)}
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
            `€${subtotal.toFixed(2)}`;

    }


    if (liveSellTotal) {

        liveSellTotal.textContent =
            `€${subtotal.toFixed(2)}`;

    }


    if (liveSellPayAmount) {

        liveSellPayAmount.textContent =
            `€${subtotal.toFixed(2)}`;

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