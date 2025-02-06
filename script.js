let header = document.querySelector('.header-main');
let navbar = document.querySelector('.navbar');

document.querySelector('#menu').onclick = () =>{
    navbar.classList.toggle('active');
}

window.onscroll = () =>{
    navbar.classList.remove('active');

    if(window.scrollY > 120){
        header.classList.add('active');
    }else{
        header.classList.remove('active');
    }
}

let accordions = document.querySelectorAll('.accordion-container .accordion');

accordions.forEach(acco =>{
    acco.onclick = () =>{
        accordions.forEach(subAcco => {
            subAcco.classList.remove('active')
        });
        acco.classList.add('active');
    }
});

var swiper = new Swiper(".review-slider",{
    spaceBetween: 20,
    centeredSlides: true,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    autoplay: {
        delay: 7500,
        disableOnInteraction: false,
    },
    grabCursor: true,
    loop: true,
});

// Function to show selected section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.navbar a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });
}

// Function to toggle product categories
function toggleCategory(categoryId) {
    const productList = document.getElementById(categoryId);
    const categoryHeader = productList.previousElementSibling;
    
    // Remove active class from all other categories
    document.querySelectorAll('.product-list').forEach(list => {
        if (list.id !== categoryId) {
            list.classList.remove('active');
            list.previousElementSibling.classList.remove('active');
        }
    });
    
    // Toggle active class for clicked category
    productList.classList.toggle('active');
    categoryHeader.classList.toggle('active');
}
