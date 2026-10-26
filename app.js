// Supabase Access Point Definition Configuration
const SB_URL = "https://hdknwsrbyjymvduvzsbb.supabase.co";
const SB_KEY = "sb_publishable_UD5i_tFDmxo1OU9XMbxAAw_vj6e2Kng";
const _supabase = supabase.createClient(SB_URL, SB_KEY);
let currentRole = "";
let currentUserEmail = "";

document.addEventListener("DOMContentLoaded", function () {
    setupCarousel('creatorsCarousel');
    setupCarousel('gamePlayCarousel');

    const dropdownElement = document.getElementById('aboutDropdown');
    if (dropdownElement) {
        const dropdown = new bootstrap.Dropdown(dropdownElement, { autoClose: true });
        dropdownElement.addEventListener('click', function (e) { e.preventDefault(); dropdown.toggle(); });
    }
});

function setupCarousel(carouselId) {
    const myCarousel = document.getElementById(carouselId);
    if (myCarousel) {
        const bsCarousel = new bootstrap.Carousel(myCarousel, { interval: 3500, ride: 'carousel', wrap: true, touch: true });
        let startX = 0, endX = 0;
        myCarousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
        myCarousel.addEventListener('touchend', e => { endX = e.changedTouches[0].clientX; handleSwipe(bsCarousel, startX, endX); });
        myCarousel.addEventListener('mousedown', e => { startX = e.clientX; myCarousel.isDragging = true; });
        myCarousel.addEventListener('mouseup', e => { if (!myCarousel.isDragging) return; endX = e.clientX; myCarousel.isDragging = false; handleSwipe(bsCarousel, startX, endX); });
        myCarousel.addEventListener('mouseleave', () => { myCarousel.isDragging = false; });
    }
}

function handleSwipe(carouselInstance, startX, endX) {
    const threshold = 50;
    if (startX - endX > threshold) carouselInstance.next();
    else if (endX - startX > threshold) carouselInstance.prev();
}

function scrollToSection(id) {
    const navbarCollapse = document.getElementById('navbarContent');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) new bootstrap.Collapse(navbarCollapse).hide();
    const dropdownElement = document.getElementById('aboutDropdown');
    const dropdown = bootstrap.Dropdown.getInstance(dropdownElement);
    if (dropdown) dropdown.hide();

    const isHomeVisible = !document.getElementById('home').classList.contains('d-none');

    if (!isHomeVisible) {
        // Kapag galing sa Sign Up, Login, o Dashboard: Lumipat sa Home muna nang walang auto-scroll sa itaas
        showSection('home', false);
        setTimeout(() => { 
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' }); 
            }
        }, 100);
    } else {
        // Kapag nasa Home na: Mag-scroll nang direkta papunta sa target section nang HINDI nagso-scroll up muna sa unahan
        const target = document.getElementById(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' }); 
        }
    }
}

function showSection(id, shouldScrollTop = true) {
    const navbarCollapse = document.getElementById('navbarContent');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) new bootstrap.Collapse(navbarCollapse).hide();

    const heroWrapper = document.getElementById('hero-wrapper');
    const appFooter = document.getElementById('app-footer');

    if (id === 'home') {
        if (heroWrapper) heroWrapper.classList.remove('d-none');
        if (appFooter) appFooter.classList.remove('d-none');
    } else {
        if (heroWrapper) heroWrapper.classList.add('d-none');
        if (appFooter) appFooter.classList.add('d-none');
    }

    document.querySelectorAll('.view-section').forEach(s => s.classList.add('d-none'));
    document.getElementById(id).classList.remove('d-none');

    const navLobby = document.getElementById('lobby-nav'), navDash = document.getElementById('dash-nav');
    if (currentRole) { navLobby.classList.add('d-none'); navDash.classList.remove('d-none'); } 
    else { navLobby.classList.remove('d-none'); navDash.classList.add('d-none'); }
    
    if (id === 'settings-view') {
        document.getElementById('current-user-info').innerText = "Logged in as: " + (currentUserEmail || (currentRole.toUpperCase() + " User"));
    }
    
    if (shouldScrollTop) {
        window.scrollTo(0, 0);
    }
}

async function handleSignup() {
    const fname = document.getElementById('s-fname').value.trim();
    const sname = document.getElementById('s-sname').value.trim();
    const email = document.getElementById('s-email').value.trim().toLowerCase();
    const pass = document.getElementById('s-pass').value;
    const repass = document.getElementById('s-repass').value;

    if (!fname || !sname || !email || !pass || !repass) {
        alert("Mangyaring punan ang lahat ng kahon.");
        return;
    }
    if (pass !== repass) {
        alert("Hindi magkatugma ang mga password.");
        return;
    }
    if (pass.length < 6) {
        alert("Ang password ay dapat hindi bababa sa 6 na karakter.");
        return;
    }

    try {
        const { data, error } = await _supabase.auth.signUp({
            email: email,
            password: pass,
            options: {
                data: { first_name: fname, surname: sname }
            }
        });

        if (error) {
            alert("Signup Error: " + error.message);
            return;
        }

        alert("Matagumpay na naipadala ang signup request! Mangyaring mag-login.");
        showSection('login-teacher');
    } catch (err) {
        alert("May naganap na error sa pag-sign up.");
        console.error(err);
    }
}

async function handleLogin(role) { 
    const email = (role === 'admin' ? document.getElementById('a-email') : document.getElementById('t-email')).value.trim().toLowerCase();
    const pass = (role === 'admin' ? document.getElementById('a-pass') : document.getElementById('t-pass')).value;
    
    if (!email || !pass) { 
        alert("Mangyaring ilagay ang iyong Email at Password."); 
        return; 
    }
    
    try {
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: pass
        });

        if (error) {
            alert("Login Failed: " + error.message);
            return;
        }

        currentUserEmail = email;

        if (role === 'admin' && email === "zacharielleh08@gmail.com") { 
            currentRole = 'admin'; 
            showSection('dash-admin'); 
        } else if (role === 'teacher') { 
            currentRole = 'teacher'; 
            showSection('dash-teacher'); 
        } else if (role === 'admin') {
            alert("Hindi ka awtorisadong Admin.");
            await _supabase.auth.signOut();
        }
    } catch (err) {
        alert("May naganap na error sa pag-login.");
        console.error(err);
    }
}

function changeProfilePicture() { document.getElementById('profile-upload').click(); }

function handleProfileUpload(event) {
    const file = event.target.files[0];
    if (file) alert("Matagumpay na na-update ang iyong Profile Picture!");
}

async function changeEmailAddress() {
    const newEmail = prompt("Ipasok ang iyong bagong Email Address:", currentUserEmail);
    if (newEmail && newEmail.trim() !== "" && newEmail !== currentUserEmail) {
        try {
            const { error } = await _supabase.auth.updateUser({ email: newEmail.trim() });
            if (error) {
                alert("Error: " + error.message);
            } else {
                currentUserEmail = newEmail.trim();
                alert("Matagumpay na na-update ang iyong Email Address!");
            }
            showSection('settings-view');
        } catch (err) {
            console.error(err);
        }
    }
}

async function changePassword() {
    const newPassword = prompt("Ipasok ang iyong bagong Password (minimum 6 characters):");
    if (newPassword && newPassword.trim().length >= 6) {
        try {
            const { error } = await _supabase.auth.updateUser({ password: newPassword.trim() });
            if (error) {
                alert("Error sa pagpalit ng password: " + error.message);
            } else {
                alert("Matagumpay na pinalitan ang iyong Password!");
            }
        } catch (err) {
            alert("May naganap na error.");
            console.error(err);
        }
    } else if (newPassword) {
        alert("Masyadong maikli ang password. Kailangan ay may 6 o higit pang karakter.");
    }
}

async function loadStatistics() {
    showSection('view-stats');
    try {
        const { count: studentCount } = await _supabase.from('Students').select('*', { count: 'exact', head: true });
        const { count: quizCount } = await _supabase.from('Quizzes').select('*', { count: 'exact', head: true });
        const { count: scoreCount } = await _supabase.from('Score').select('*', { count: 'exact', head: true });

        document.getElementById('stat-students').innerText = studentCount !== null ? studentCount : 0;
        document.getElementById('stat-quizzes').innerText = quizCount !== null ? quizCount : 0;
        document.getElementById('stat-scores').innerText = scoreCount !== null ? scoreCount : 0;
    } catch (err) {
        console.error(err);
    }
}

async function loadScoresAndShow() {
    showSection('view-scores');
    const container = document.getElementById('scores-list-container');
    container.innerHTML = '<div class="text-muted small"><span class="spinner-border spinner-border-sm me-2"></span>Kinukuha ang mga rekord mula sa database...</div>';
    
    try {
        const { data, error } = await _supabase.from('Score').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="alert alert-warning small m-0">Walang nakitang rekord ng scores sa kasalukuyan.</div>';
            return;
        }
        container.innerHTML = data.map(item => `
            <div class="data-card">
                <span>${item.student_name || 'Walang Pangalan'}</span>
                <div>
                    <b class="me-3">${item.score}/${item.total}</b>
                    <button class="btn btn-sm btn-danger" onclick="dbDeleteScore('${item.id}')"><i class="bi bi-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="alert alert-danger small mb-3">Hindi matuloy ang koneksyon sa Supabase.</div>`;
    }
}

async function dbAddScore() {
    const studentName = document.getElementById('score-student-name').value.trim();
    const scoreValue = document.getElementById('score-value').value.trim();
    const totalItems = document.getElementById('score-total').value.trim();

    if (!studentName || !scoreValue || !totalItems) {
        alert("Mangyaring punan ang lahat ng kahon bago mag-add.");
        return;
    }

    try {
        const { error } = await _supabase.from('Score').insert([{ student_name: studentName, score: parseInt(scoreValue), total: parseInt(totalItems) }]);
        if (error) throw error;

        document.getElementById('score-student-name').value = "";
        document.getElementById('score-value').value = "";
        document.getElementById('score-total').value = "";
        loadScoresAndShow();
    } catch (error) {
        console.error(error);
    }
}

async function dbDeleteScore(id) {
    if (confirm("Sigurado ka bang nais mong burahin ang score na ito?")) {
        try {
            const { error } = await _supabase.from('Score').delete().eq('id', id);
            if (error) throw error;
            loadScoresAndShow();
        } catch (error) {
            console.error(error);
        }
    }
}

function togglePass(id, icon) {
    const x = document.getElementById(id);
    x.type = x.type === "password" ? "text" : "password";
    icon.classList.toggle('bi-eye-slash'); icon.classList.toggle('bi-eye');
}

function handleForgot() { alert("Reset instructions sent to email."); }
async function logout() { 
    await _supabase.auth.signOut();
    currentRole = ""; 
    currentUserEmail = ""; 
    showSection('home'); 
}
function goBack() { showSection(currentRole === 'admin' ? 'dash-admin' : 'dash-teacher'); }
function handleLogoClick() { if (!currentRole) showSection('home'); else goBack(); }

async function loadData(table, listId) {
    const { data, error } = await _supabase.from(table).select('*').order('created_at', {ascending: false});
    if (error) return;
    document.getElementById(listId).innerHTML = data.map(item => `
        <div class="data-card"><span>${item.name}</span>
        <button class="btn btn-sm btn-danger" onclick="dbDelete('${table}', '${item.id}', '${listId}')"><i class="bi bi-trash"></i></button></div>
    `).join('') || "No records.";
}

async function dbAdd(table, inputId, listId) {
    const val = document.getElementById(inputId).value.trim();
    if (val) { await _supabase.from(table).insert([{ name: val }]); document.getElementById(inputId).value = ""; loadData(table, listId); }
}

async function dbDelete(table, id, listId) {
    if(confirm("Delete?")) { await _supabase.from(table).delete().eq('id', id); loadData(table, listId); }
}

function loadAndShow(table, listId, sectionId) { showSection(sectionId); loadData(table, listId); }
