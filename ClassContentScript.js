{
    const NowDate = () => {
        const offset = new Date();
        
        return (new Date(offset.getTime() - (offset.getTimezoneOffset() * 60000))).toISOString();
    }   
}