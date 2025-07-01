'use strict';

//Enabling Mobile Menu

const menuToggleBtn = document.querySelector('[data-navbar-toggle-btn]');
const navbar = document.querySelector('[data-navbar]');

const elemToggleFunc = function(elem) { elem.classList.toggle("active"); }
menuToggleBtn.addEventListener("click", function() { elemToggleFunc(navbar); });

//Enabling Go to Top

const goTopBtn = document.querySelector('[data-go-top]');

window.addEventListener('scroll', function() {
    if(window.scrollY >= 800) {
        goTopBtn.classList.add('active');
    } else {
        goTopBtn.classList.remove('active');
    }
})            