// =========================================
// 1. SEPET VERİSİNİ YÜKLE
// =========================================
let cart = JSON.parse(localStorage.getItem('alisverisSepeti')) || [];
updateCartCount();

// =========================================
// 2. ARAMA İŞLEVİ (GELİŞMİŞ - ETİKET DESTEKLİ)
// =========================================

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.trim();
    if (query) {
        window.location.href = `products.html?q=${encodeURIComponent(query)}`;
    }
}

const searchInputBox = document.getElementById('searchInput');
if (searchInputBox) {
    searchInputBox.addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            performSearch();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const productList = document.querySelector('.product-list');
    
    if (productList) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        
        if (searchQuery) {
            // Aranan kelimeyi küçük harfe çevir (büyük-küçük harf duyarlılığını kaldır)
            const term = searchQuery.toLowerCase(); 
            const products = document.querySelectorAll('.product');
            let foundCount = 0;
            
            if (searchInputBox) searchInputBox.value = searchQuery;

            products.forEach(prod => {
                // 1. Ürün Başlığını Al
                const title = prod.querySelector('h3').innerText.toLowerCase();
                
                // 2. Gizli Anahtar Kelimeleri (data-keywords) Al
                // Eğer etiket yoksa boş kabul et
                const keywords = prod.getAttribute('data-keywords') ? prod.getAttribute('data-keywords').toLowerCase() : "";
                
                // KONTROL: Başlıkta VARSA -VEYA- Gizli Kelimelerde VARSA göster
                if (title.includes(term) || keywords.includes(term)) {
                    prod.style.display = 'flex';
                    foundCount++;
                } else {
                    prod.style.display = 'none';
                }
            });
            
            if (foundCount === 0) {
                const msg = document.createElement('p');
                msg.innerText = `"${searchQuery}" ile ilgili ürün bulunamadı.`;
                msg.style.width = "100%";
                msg.style.textAlign = "center";
                msg.style.fontSize = "1.2rem";
                msg.style.gridColumn = "1 / -1";
                msg.style.marginTop = "20px";
                productList.appendChild(msg);
            }
        }
    }
});

// =========================================
// 3. ÜRÜN İNCELEME MODALI
// =========================================
const detailButtons = document.querySelectorAll('.btn-detail');
const productModal = document.getElementById('productModal');

detailButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        const title = this.getAttribute('data-title');
        const price = this.getAttribute('data-price');
        const img = this.getAttribute('data-img');
        const desc = this.getAttribute('data-desc');

        if(document.getElementById('modalTitle')) {
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalPrice').innerText = price;
            document.getElementById('modalImg').src = img;
            document.getElementById('modalDesc').innerText = desc;
            productModal.style.display = 'flex';
        }
    });
});

// =========================================
// 4. SEPET İŞLEMLERİ
// =========================================
function addToCart() {
    const title = document.getElementById('modalTitle').innerText;
    const price = document.getElementById('modalPrice').innerText;
    const img = document.getElementById('modalImg').src;

    const existingItem = cart.find(item => item.title.trim() === title.trim());

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        const product = { 
            title: title, 
            price: price, 
            img: img,
            quantity: 1 
        };
        cart.push(product);
    }

    saveCartToStorage();
    updateCartCount();
    closeModal('productModal');
    alert("Ürün sepete eklendi!");
}

function openCart() {
    const cartModal = document.getElementById('cartModal');
    const cartContainer = document.getElementById('cartItemsContainer');
    const totalElement = document.getElementById('cartTotal');
    
    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; color:#777;">Sepetiniz boş.</p>';
        totalElement.innerText = '0 ₺';
    } else {
        let totalPrice = 0;
        
        cart.forEach((item, index) => {
            let priceNumber = parseFloat(item.price.replace(' ₺', ''));
            let qty = item.quantity || 1;
            totalPrice += priceNumber * qty;
            
            const itemHTML = `
                <div style="display:flex; gap:10px; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                    <img src="${item.img}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">
                    <div style="flex:1;">
                        <h4 style="margin:0; font-size:14px;">
                            ${item.title} 
                            <span style="color:#d84315; font-weight:bold; margin-left:5px;">(x${qty})</span>
                        </h4>
                        <span style="color:#C08A7D; font-weight:bold;">${item.price}</span>
                    </div>
                    <i class="fa-solid fa-trash" style="color:red; cursor:pointer;" onclick="removeFromCart(${index})"></i>
                </div>`;
            cartContainer.innerHTML += itemHTML;
        });
        
        totalElement.innerText = totalPrice + ' ₺';
    }
    cartModal.style.display = 'flex';
}

function removeFromCart(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    saveCartToStorage();
    updateCartCount();
    openCart(); 
}

function goToCheckout() {
    if (cart.length === 0) {
        alert("Sepetiniz boş! Lütfen önce ürün ekleyin.");
        return; 
    }
    alert("Ödeme sayfanıza yönlendiriliyorsunuz...");
    closeCart();
}

// =========================================
// 5. YARDIMCI FONKSİYONLAR
// =========================================
function saveCartToStorage() { localStorage.setItem('alisverisSepeti', JSON.stringify(cart)); }

function updateCartCount() { 
    const badge = document.getElementById('sepet-sayaci');
    if(badge) {
        let totalCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        badge.innerText = totalCount;
    }
}

function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }
function closeCart() { document.getElementById('cartModal').style.display = 'none'; }

document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', function() { this.parentElement.parentElement.style.display = 'none'; });
});
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) { event.target.style.display = "none"; }
}

// =========================================
// 6. İLETİŞİM FORMU KONTROLÜ
// =========================================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); 
        alert("Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.");
        this.reset();
    });
}
/* =========================================
   SIDEBAR (YAN MENÜ) KONTROLÜ
   ========================================= */
function toggleMenu() {
    const sidenav = document.getElementById("mySidenav");
    const overlay = document.getElementById("overlay");
    
    // Eğer sidebar şu an açıksa kapat, kapalıysa aç
    if (sidenav.style.width === "250px") {
        closeNav();
    } else {
        openNav();
    }
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("overlay").style.display = "block";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("overlay").style.display = "none";
}

// Overlay'a tıklayınca kapat
document.addEventListener("DOMContentLoaded", function() {
    /* Overlay elementini JS ile ekleyebiliriz veya HTML'de var olduğunu varsayabiliriz.
       Planımızda HTML'e eklemek vardı, ama JS ile de create edebiliriz garantilemek için. */
    let overlay = document.getElementById('overlay');
    if(!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.onclick = closeNav;
        document.body.appendChild(overlay);
    } else {
        overlay.onclick = closeNav;
    }
});
