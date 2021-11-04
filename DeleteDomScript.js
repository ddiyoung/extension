{
    const DeleteDom = () =>{
        console.log("DeleteDom");
        $('#classBody').remove();
        const siteMenu = document.getElementById('side-menu');
        siteMenu.style.transform = 'translateY(0px)';
    }

    const main = () =>{
        DeleteDom();
    }

    main();
}