// প্যাকেজ ডাটা
const packages = {
    diamond: [
        { id: 1, name: "25 Diamond", diamonds: "25", price: 24, originalPrice: 30 },
        { id: 2, name: "50 Diamond", diamonds: "50", price: 45, originalPrice: 60 },
        { id: 3, name: "115 Diamond", diamonds: "115", price: 78, originalPrice: 100 },
        { id: 4, name: "240 Diamond", diamonds: "240", price: 160, originalPrice: 200 },
        { id: 5, name: "480 Diamond", diamonds: "480", price: 310, originalPrice: 390 },
        { id: 6, name: "610 Diamond", diamonds: "610", price: 390, originalPrice: 490 },
        { id: 7, name: "1240 Diamond", diamonds: "1240", price: 795, originalPrice: 999 },
        { id: 8, name: "2530 Diamond", diamonds: "2530", price: 1679, originalPrice: 2100 },
        { id: 9, name: "5060 Diamond", diamonds: "5060", price: 3358, originalPrice: 4200 },
        { id: 10, name: "10120 Diamond", diamonds: "10120", price: 6716, originalPrice: 8400 }
    ],
    weekly: [
        { id: 11, name: "Weekly", diamonds: "Weekly", price: 160, originalPrice: 200 },
        { id: 12, name: "Weekly Lite", diamonds: "Weekly Lite", price: 45, originalPrice: 60 },
        { id: 13, name: "Monthly", diamonds: "Monthly", price: 780, originalPrice: 999 }
    ],
    airdrop: [
        { id: 14, name: "0.99$ Airdrop", diamonds: "0.99$ (90 BDT)", price: 145, originalPrice: 180 },
        { id: 15, name: "1.99$ Airdrop", diamonds: "1.99$ (190 BDT)", price: 289, originalPrice: 360 },
        { id: 16, name: "3.99$ Airdrop", diamonds: "3.99$ (390 BDT)", price: 449, originalPrice: 560 }
    ],
    evo: [
        { id: 17, name: "3 Day Evo Access", diamonds: "3 Days", price: 60, originalPrice: 75 },
        { id: 18, name: "7 Days Evo Access", diamonds: "7 Days", price: 100, originalPrice: 130 },
        { id: 19, name: "30 Days Evo Access", diamonds: "30 Days", price: 250, originalPrice: 320 }
    ]
};

// বিকাশ/নগদ API কনফিগারেশন (ডেমো কিগ)
const paymentConfig = {
    bkash: {
        apiKey: "demo_bkash_api_key",
        baseUrl: "https://demo.bkash-api.com/v1.2.0-beta",
        merchantNumber: "01540651159"
    },
    nagad: {
        apiKey: "demo_nagad_api_key",
        baseUrl: "https://api.mynagad.com/api",
        merchantNumber: "01540651159"
    }
};

// অর্ডার ডাটা
let orders = JSON.parse(localStorage.getItem('ff_orders')) || [];
let selectedPackage = null;
let currentOrderId = null;

// পৃষ্ঠা লোড হওয়ার পর
document.addEventListener('DOMContentLoaded', function() {
    // প্যাকেজ লোড করুন
    loadPackages();
    
    // অর্ডার লিস্ট লোড করুন
    loadOrderList();
    
    // স্ট্যাটস আপডেট করুন
    updateStats();
    
    // ফর্ম সাবমিট ইভেন্ট
    document.getElementById('orderForm').addEventListener('submit', submitOrder);
    
    // প্যাকেজ সিলেক্ট ইভেন্ট
    document.getElementById('package').addEventListener('change', updateSelectedPrice);
    
    // ফিল্টার বাটন ইভেন্ট
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterOrders(this.dataset.filter);
        });
    });
    
    // মডেল ক্লোজ ইভেন্ট
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.getElementById('modal-ok-btn').addEventListener('click', closeModal);
    
    // প্রতি 30 সেকেন্ডে অর্ডার লিস্ট আপডেট করুন
    setInterval(loadOrderList, 30000);
    
    // প্রতি 30 সেকেন্ডে পেমেন্ট ভেরিফিকেশন চেক করুন
    setInterval(checkPendingPayments, 30000);
    
    // পেমেন্ট ভেরিফিকেশন নোট শো করুন
    document.getElementById('verification-note').style.display = 'block';
});

// প্যাকেজ লোড ফাংশন
function loadPackages() {
    // ডায়মন্ড প্যাকেজ
    const diamondGrid = document.getElementById('diamond-packages');
    packages.diamond.forEach(pkg => {
        diamondGrid.appendChild(createPackageCard(pkg, 'diamond'));
    });
    
    // উইকলি/মান্থলি প্যাকেজ
    const weeklyGrid = document.getElementById('weekly-packages');
    packages.weekly.forEach(pkg => {
        weeklyGrid.appendChild(createPackageCard(pkg, 'weekly'));
    });
    
    // এয়ারড্রপ প্যাকেজ
    const airdropGrid = document.getElementById('airdrop-packages');
    packages.airdrop.forEach(pkg => {
        airdropGrid.appendChild(createPackageCard(pkg, 'airdrop'));
    });
    
    // ইভো অ্যাক্সেস প্যাকেজ
    const evoGrid = document.getElementById('evo-packages');
    packages.evo.forEach(pkg => {
        evoGrid.appendChild(createPackageCard(pkg, 'evo'));
    });
    
    // ফর্মের জন্য প্যাকেজ অপশন
    const packageSelect = document.getElementById('package');
    Object.values(packages).forEach(category => {
        category.forEach(pkg => {
            const option = document.createElement('option');
            option.value = pkg.id;
            option.textContent = `${pkg.name} - ${pkg.price} টাকা`;
            packageSelect.appendChild(option);
        });
    });
}

// প্যাকেজ কার্ড তৈরি করুন
function createPackageCard(pkg, type) {
    const card = document.createElement('div');
    card.className = 'package-card';
    card.dataset.id = pkg.id;
    card.dataset.type = type;
    
    let discount = '';
    if (pkg.originalPrice) {
        const discountPercent = Math.round((1 - pkg.price / pkg.originalPrice) * 100);
        discount = `<span class="original-price">${pkg.originalPrice} টাকা</span> <span style="color:#4CAF50">(-${discountPercent}%)</span>`;
    }
    
    card.innerHTML = `
        <h3><i class="fas fa-gem diamond-icon"></i> ${pkg.name}</h3>
        <p>${pkg.diamonds}</p>
        <div class="price">${pkg.price} টাকা</div>
        ${discount}
        <button class="btn-select" onclick="selectPackage(${pkg.id})">সিলেক্ট করুন</button>
    `;
    
    return card;
}

// প্যাকেজ সিলেক্ট করুন
function selectPackage(id) {
    // সকল প্যাকেজ কার্ড থেকে সিলেক্টেড ক্লাস সরান
    document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // সিলেক্টেড প্যাকেজ কার্ড হাইলাইট করুন
    const selectedCard = document.querySelector(`.package-card[data-id="${id}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // ফর্মের প্যাকেজ সিলেক্ট করুন
    document.getElementById('package').value = id;
    
    // সিলেক্টেড প্যাকেজ খুঁজে বের করুন
    let selected = null;
    Object.values(packages).forEach(category => {
        const found = category.find(pkg => pkg.id === id);
        if (found) selected = found;
    });
    
    if (selected) {
        selectedPackage = selected;
        document.getElementById('selected-price').textContent = selected.price;
        
        // স্ক্রল টু ফর্ম
        document.querySelector('.order-form').scrollIntoView({ behavior: 'smooth' });
    }
}

// সিলেক্টেড প্যাকেজের মূল্য আপডেট করুন
function updateSelectedPrice() {
    const packageId = parseInt(document.getElementById('package').value);
    
    if (packageId) {
        selectPackage(packageId);
    } else {
        document.getElementById('selected-price').textContent = '0';
        selectedPackage = null;
    }
}

// অর্ডার সাবমিট করুন
async function submitOrder(e) {
    e.preventDefault();
    
    if (!selectedPackage) {
        alert('দয়া করে একটি প্যাকেজ সিলেক্ট করুন');
        return;
    }
    
    // ফর্ম ডাটা সংগ্রহ করুন
    const uid = document.getElementById('uid').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const paymentMethod = document.getElementById('payment-method').value;
    const transactionId = document.getElementById('transaction').value.trim();
    
    // ভ্যালিডেশন
    if (!uid || uid.length < 9) {
        alert('দয়া করে সঠিক Free Fire UID দিন (9-12 ডিজিট)');
        return;
    }
    
    if (!phone || !/^01[3-9]\d{8}$/.test(phone)) {
        alert('দয়া করে সঠিক বাংলাদেশী ফোন নম্বর দিন (11 ডিজিট)');
        return;
    }
    
    if (!paymentMethod) {
        alert('দয়া করে পেমেন্ট মেথড সিলেক্ট করুন');
        return;
    }
    
    if (!transactionId) {
        alert('দয়া করে ট্রানজেকশন আইডি দিন');
        return;
    }
    
    // বাটন ডিজেবল করুন
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> প্রসেসিং...';
    
    try {
        // অর্ডার আইডি জেনারেট করুন
        const orderId = 'ORD' + Date.now().toString().slice(-8);
        currentOrderId = orderId;
        
        // অর্ডার তৈরি করুন
        const order = {
            id: orderId,
            packageId: selectedPackage.id,
            packageName: selectedPackage.name,
            diamonds: selectedPackage.diamonds,
            price: selectedPackage.price,
            uid: uid,
            phone: phone,
            paymentMethod: paymentMethod,
            transactionId: transactionId,
            status: 'pending',
            paymentStatus: 'checking',
            timestamp: new Date().toISOString(),
            timeText: new Date().toLocaleString('bn-BD')
        };
        
        // অর্ডার লিস্টে যোগ করুন
        orders.unshift(order);
        
        // লোকাল স্টোরেজে সংরক্ষণ করুন
        localStorage.setItem('ff_orders', JSON.stringify(orders));
        
        // WhatsApp নোটিফিকেশন পাঠান
        sendWhatsAppNotification(order);
        
        // পেমেন্ট ভেরিফিকেশন প্রক্রিয়া শুরু করুন
        await verifyPayment(order);
        
        // স্ট্যাটস আপডেট করুন
        updateStats();
        
        // ভেরিফিকেশন সেকশন শো করুন
        showVerificationSection(order);
        
        // ফর্ম রিসেট করুন
        document.getElementById('orderForm').reset();
        document.getElementById('selected-price').textContent = '0';
        
        // সিলেক্টেড প্যাকেজ আনসিলেক্ট করুন
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
        selectedPackage = null;
        
    } catch (error) {
        console.error('অর্ডার সাবমিট ব্যর্থ:', error);
        alert('অর্ডার সাবমিট ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    } finally {
        // বাটন এনাবল করুন
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> অর্ডার কনফার্ম করুন';
    }
}

// WhatsApp নোটিফিকেশন পাঠান
function sendWhatsAppNotification(order) {
    // এটি একটি মক ফাংশন। বাস্তবে, আপনি একটি সার্ভার-সাইড স্ক্রিপ্ট ব্যবহার করবেন
    // যেমন PHP দিয়ে WhatsApp API কল করার জন্য
    
    const message = `
নতুন অর্ডার!
অর্ডার আইডি: ${order.id}
প্যাকেজ: ${order.packageName}
ডায়মন্ড: ${order.diamonds}
মূল্য: ${order.price} টাকা
UID: ${order.uid}
ফোন: ${order.phone}
পেমেন্ট: ${order.paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'}
ট্রানজেকশন: ${order.transactionId}
সময়: ${order.timeText}
    `;
    
    console.log('WhatsApp Notification:', message);
    console.log('WhatsApp Number: 01748320647');
    
    // বাস্তব ইমপ্লিমেন্টেশনের জন্য:
    // fetch('api/send-whatsapp.php', {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify({message, number: '01748320647'})
    // });
}

// পেমেন্ট ভেরিফাই করুন
async function verifyPayment(order) {
    return new Promise((resolve, reject) => {
        // ভেরিফিকেশন প্রসেস শো করুন
        updateVerificationStatus('checking', 'ট্রানজেকশন চেক করা হচ্ছে...', 30);
        
        // সিমুলেট API কল (বাস্তবে এখানে আসল API কল হবে)
        setTimeout(() => {
            updateVerificationStatus('processing', 'ট্রানজেকশন ডিটেইলস পাওয়া যাচ্ছে...', 60);
            
            setTimeout(() => {
                // ডেমো ভেরিফিকেশন রেজাল্ট
                // বাস্তবে এখানে আসল API রেসপন্স প্রসেস হবে
                const isVerified = Math.random() > 0.1; // 90% success rate
                
                if (isVerified) {
                    // সফল ভেরিফিকেশন
                    updateVerificationStatus('success', 'ট্রানজেকশন ভেরিফাইড!', 100);
                    
                    // অর্ডার আপডেট করুন
                    const orderIndex = orders.findIndex(o => o.id === order.id);
                    if (orderIndex !== -1) {
                        orders[orderIndex].status = 'confirmed';
                        orders[orderIndex].paymentStatus = 'verified';
                        orders[orderIndex].verifiedAt = new Date().toISOString();
                        
                        // লোকাল স্টোরেজ আপডেট করুন
                        localStorage.setItem('ff_orders', JSON.stringify(orders));
                        
                        // WhatsApp নোটিফিকেশন পাঠান
                        sendConfirmationNotification(order);
                    }
                    
                    // সফলতা মডেল শো করুন
                    setTimeout(() => {
                        showSuccessModal(order, true);
                        resolve();
                    }, 1500);
                    
                } else {
                    // ব্যর্থ ভেরিফিকেশন
                    updateVerificationStatus('failed', 'ট্রানজেকশন ভেরিফাই করতে ব্যর্থ', 100);
                    
                    // অর্ডার আপডেট করুন
                    const orderIndex = orders.findIndex(o => o.id === order.id);
                    if (orderIndex !== -1) {
                        orders[orderIndex].status = 'failed';
                        orders[orderIndex].paymentStatus = 'failed';
                        orders[orderIndex].failedReason = 'Invalid transaction or amount mismatch';
                        
                        // লোকাল স্টোরেজ আপডেট করুন
                        localStorage.setItem('ff_orders', JSON.stringify(orders));
                    }
                    
                    // ব্যর্থতা মডেল শো করুন
                    setTimeout(() => {
                        showSuccessModal(order, false);
                        resolve();
                    }, 1500);
                }
                
                // অর্ডার লিস্ট আপডেট করুন
                loadOrderList();
                updateStats();
                
            }, 2000);
        }, 2000);
    });
}

// ভেরিফিকেশন স্ট্যাটাস আপডেট করুন
function updateVerificationStatus(status, message, progress) {
    const titleEl = document.getElementById('verification-title');
    const messageEl = document.getElementById('verification-message');
    const progressEl = document.getElementById('verification-progress');
    const detailsEl = document.getElementById('verification-details');
    
    progressEl.style.width = progress + '%';
    
    switch(status) {
        case 'checking':
            titleEl.innerHTML = '<i class="fas fa-search-dollar"></i> পেমেন্ট চেক করা হচ্ছে...';
            messageEl.textContent = message;
            detailsEl.innerHTML = `
                <h4><i class="fas fa-info-circle"></i> ভেরিফিকেশন ডিটেইলস:</h4>
                <ul>
                    <li><span class="status-label">স্ট্যাটাস:</span> <span class="status-value">চেকিং...</span></li>
                    <li><span class="status-label">সময়:</span> <span class="status-value">${new Date().toLocaleTimeString('bn-BD')}</span></li>
                </ul>
            `;
            break;
            
        case 'processing':
            titleEl.innerHTML = '<i class="fas fa-cogs"></i> প্রসেসিং...';
            messageEl.textContent = message;
            detailsEl.innerHTML = `
                <h4><i class="fas fa-info-circle"></i> ভেরিফিকেশন ডিটেইলস:</h4>
                <ul>
                    <li><span class="status-label">স্ট্যাটাস:</span> <span class="status-value">প্রসেসিং...</span></li>
                    <li><span class="status-label">সময়:</span> <span class="status-value">${new Date().toLocaleTimeString('bn-BD')}</span></li>
                    <li><span class="status-label">অগ্রগতি:</span> <span class="status-value">${progress}%</span></li>
                </ul>
            `;
            break;
            
        case 'success':
            titleEl.innerHTML = '<i class="fas fa-check-circle"></i> পেমেন্ট ভেরিফাইড!';
            messageEl.textContent = message;
            messageEl.style.color = '#4CAF50';
            detailsEl.innerHTML = `
                <h4><i class="fas fa-check-circle"></i> ভেরিফিকেশন সফল!</h4>
                <ul>
                    <li><span class="status-label">স্ট্যাটাস:</span> <span class="status-value" style="color:#4CAF50">ভেরিফাইড</span></li>
                    <li><span class="status-label">সময়:</span> <span class="status-value">${new Date().toLocaleTimeString('bn-BD')}</span></li>
                    <li><span class="status-label">অর্ডার আইডি:</span> <span class="status-value">${currentOrderId}</span></li>
                    <li><span class="status-label">মন্তব্য:</span> <span class="status-value">অর্ডার স্বয়ংক্রিয়ভাবে কনফার্ম হবে</span></li>
                </ul>
            `;
            break;
            
        case 'failed':
            titleEl.innerHTML = '<i class="fas fa-times-circle"></i> ভেরিফিকেশন ব্যর্থ';
            messageEl.textContent = message;
            messageEl.style.color = '#f44336';
            detailsEl.innerHTML = `
                <h4><i class="fas fa-exclamation-triangle"></i> ভেরিফিকেশন ব্যর্থ</h4>
                <ul>
                    <li><span class="status-label">স্ট্যাটাস:</span> <span class="status-value" style="color:#f44336">ব্যর্থ</span></li>
                    <li><span class="status-label">সময়:</span> <span class="status-value">${new Date().toLocaleTimeString('bn-BD')}</span></li>
                    <li><span class="status-label">কারণ:</span> <span class="status-value">ট্রানজেকশন বা অ্যামাউন্ট মিলেনি</span></li>
                    <li><span class="status-label">সমাধান:</span> <span class="status-value">সঠিক TrxID দিন বা সাপোর্টে যোগাযোগ করুন</span></li>
                </ul>
            `;
            break;
    }
}

// ভেরিফিকেশন সেকশন শো করুন
function showVerificationSection(order) {
    const section = document.getElementById('verification-section');
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
}

// সফলতা মডেল শো করুন
function showSuccessModal(order, isSuccess) {
    const modal = document.getElementById('successModal');
    const orderIdEl = document.getElementById('modal-order-id');
    const messageEl = document.getElementById('modal-message');
    const summaryEl = document.getElementById('modal-summary');
    
    if (isSuccess) {
        modal.querySelector('.modal-header h3').innerHTML = '<i class="fas fa-check-circle"></i> অর্ডার সফল!';
        modal.querySelector('.modal-header h3').style.color = '#4CAF50';
        orderIdEl.textContent = `অর্ডার আইডি: ${order.id}`;
        messageEl.innerHTML = 'আপনার অর্ডার সফলভাবে কনফার্ম হয়েছে! ডায়মন্ড ২-৫ মিনিটের মধ্যে অ্যাকাউন্টে যোগ হবে।';
        messageEl.style.color = '#4CAF50';
        
        summaryEl.innerHTML = `
            <h5>অর্ডার সামারি:</h5>
            <div><span>প্যাকেজ:</span><span>${order.packageName}</span></div>
            <div><span>ডায়মন্ড:</span><span>${order.diamonds}</span></div>
            <div><span>মূল্য:</span><span>${order.price} টাকা</span></div>
            <div><span>UID:</span><span>${order.uid}</span></div>
            <div><span>পেমেন্ট:</span><span>${order.paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'}</span></div>
            <div><span>স্ট্যাটাস:</span><span style="color:#4CAF50">কনফার্মড</span></div>
        `;
    } else {
        modal.querySelector('.modal-header h3').innerHTML = '<i class="fas fa-times-circle"></i> ভেরিফিকেশন ব্যর্থ';
        modal.querySelector('.modal-header h3').style.color = '#f44336';
        orderIdEl.textContent = `অর্ডার আইডি: ${order.id}`;
        messageEl.innerHTML = 'ট্রানজেকশন ভেরিফিকেশন ব্যর্থ হয়েছে। দয়া করে সঠিক TrxID দিন বা সাপোর্টে যোগাযোগ করুন।';
        messageEl.style.color = '#f44336';
        
        summaryEl.innerHTML = `
            <h5>অর্ডার ডিটেইলস:</h5>
            <div><span>প্যাকেজ:</span><span>${order.packageName}</span></div>
            <div><span>মূল্য:</span><span>${order.price} টাকা</span></div>
            <div><span>UID:</span><span>${order.uid}</span></div>
            <div><span>পেমেন্ট:</span><span>${order.paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'}</span></div>
            <div><span>TrxID:</span><span>${order.transactionId}</span></div>
            <div><span>স্ট্যাটাস:</span><span style="color:#f44336">ব্যর্থ</span></div>
        `;
    }
    
    modal.style.display = 'flex';
}

// মডেল ক্লোজ করুন
function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    
    // ভেরিফিকেশন সেকশন হাইড করুন
    document.getElementById('verification-section').style.display = 'none';
}

// কনফার্মেশন নোটিফিকেশন পাঠান
function sendConfirmationNotification(order) {
    const message = `
অর্ডার কনফার্মড!
অর্ডার আইডি: ${order.id}
প্যাকেজ: ${order.packageName}
ডায়মন্ড: ${order.diamonds}
মূল্য: ${order.price} টাকা
UID: ${order.uid}
স্ট্যাটাস: ✅ কনফার্মড
সময়: ${new Date().toLocaleString('bn-BD')}
দ্রষ্টব্য: ডায়মন্ড ২-৫ মিনিটের মধ্যে পাঠানো হবে
    `;
    
    console.log('Confirmation WhatsApp:', message);
}

// অর্ডার লিস্ট লোড করুন
function loadOrderList() {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';
    
    // ফিল্টার পান
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    let filteredOrders = orders;
    
    if (activeFilter !== 'all') {
        filteredOrders = orders.filter(order => order.status === activeFilter);
    }
    
    // সর্বশেষ 20টি অর্ডার দেখান
    const recentOrders = filteredOrders.slice(0, 20);
    
    if (recentOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-inbox" style="font-size: 40px; color: #666; margin-bottom: 15px;"></i>
                    <p>কোন অর্ডার পাওয়া যায়নি</p>
                </td>
            </tr>
        `;
        return;
    }
    
    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        
        // স্ট্যাটাস ক্লাস
        let statusClass = '';
        let statusText = '';
        
        switch(order.status) {
            case 'confirmed':
                statusClass = 'status-confirmed';
                statusText = 'কনফার্মড';
                break;
            case 'pending':
                statusClass = 'status-pending';
                statusText = 'পেন্ডিং';
                break;
            case 'failed':
                statusClass = 'status-failed';
                statusText = 'ব্যর্থ';
                break;
        }
        
        // পেমেন্ট মেথড আইকন
        const paymentIcon = order.paymentMethod === 'bkash' ? 'fas fa-mobile-alt' : 'fas fa-wallet';
        const paymentText = order.paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ';
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.packageName}</td>
            <td>${order.uid}</td>
            <td class="${statusClass}">${statusText}</td>
            <td><span class="payment-method"><i class="${paymentIcon}"></i> ${paymentText}</span></td>
            <td>${order.timeText}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// অর্ডার ফিল্টার করুন
function filterOrders(filter) {
    loadOrderList();
}

// স্ট্যাটস আপডেট করুন
function updateStats() {
    const totalOrders = orders.length;
    const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('confirmed-orders').textContent = confirmedOrders;
    document.getElementById('pending-orders').textContent = pendingOrders;
}

// পেন্ডিং পেমেন্ট চেক করুন
function checkPendingPayments() {
    orders.forEach(order => {
        if (order.status === 'pending' && order.paymentStatus === 'checking') {
            // পেন্ডিং অর্ডারগুলো আবার চেক করুন
            // বাস্তবে এখানে API কল হবে
            const shouldConfirm = Math.random() > 0.3; // 70% chance
            
            if (shouldConfirm) {
                order.status = 'confirmed';
                order.paymentStatus = 'verified';
                order.verifiedAt = new Date().toISOString();
                
                // লোকাল স্টোরেজ আপডেট করুন
                localStorage.setItem('ff_orders', JSON.stringify(orders));
                
                // আপডেট ভিউ
                loadOrderList();
                updateStats();
            }
        }
    });
}

// বিকাশ API কল (ডেমো)
async function callBkashAPI(transactionId, amount) {
    // এটি একটি ডেমো ফাংশন। বাস্তবে আপনি বিকাশ API ব্যবহার করবেন
    return new Promise((resolve) => {
        setTimeout(() => {
            // ডেমো রেসপন্স
            const response = {
                success: Math.random() > 0.2, // 80% success rate
                transaction: {
                    id: transactionId,
                    amount: amount,
                    sender: '017XXXXXXXX',
                    receiver: '01540651159',
                    time: new Date().toISOString(),
                    status: 'completed'
                }
            };
            resolve(response);
        }, 1000);
    });
}

// নগদ API কল (ডেমো)
async function callNagadAPI(transactionId, amount) {
    // এটি একটি ডেমো ফাংশন। বাস্তবে আপনি নগদ API ব্যবহার করবেন
    return new Promise((resolve) => {
        setTimeout(() => {
            // ডেমো রেসপন্স
            const response = {
                success: Math.random() > 0.2, // 80% success rate
                transaction: {
                    trxId: transactionId,
                    amount: amount,
                    customerMsisdn: '017XXXXXXXX',
                    merchantMsisdn: '01540651159',
                    dateTime: new Date().toISOString(),
                    transactionStatus: 'SUCCESS'
                }
            };
            resolve(response);
        }, 1000);
    });
}