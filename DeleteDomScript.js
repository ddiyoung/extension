{
    const DeleteDom = () =>{
        console.log("DeleteDom");
        $('#AtdCheck').remove();
        $("#side-menu").width('200px');
    }

    const main = () =>{
        DeleteDom();
    }

    main();
}