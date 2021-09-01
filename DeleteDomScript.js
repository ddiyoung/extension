{
    const DeleteDom = () =>{
        console.log("DeleteDom");
        $('#classBody').remove();
        const siteMenu = document.getElementById('side-menu');
        siteMenu.style.transform = 'translateY(0px)';
        window.removeEventListener('scroll');
    }

    const main = () =>{
        DeleteDom();
    }

    main();
}