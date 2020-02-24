const puppeteer = require("puppeteer");
const {username, password} = require("./credentials");
(async ()=>{
    try{
        const browser = await puppeteer.launch({headless: false});//open browser not in background

        const context = browser.defaultBrowserContext(); //context of tinder browser to click through/on it 
        const page = await browser.newPage();
        await page.goto("https://tinder.com/");
        await context.overridePermissions("https://tinder.com/", ["geolocation"]);//allow location

        await page.setGeolocation({latitude:####, longitude:#####});//change ur location using coordinates
        await page._client.send("Emulation.clearDeviceMetricsOverride")//fix browser to full window display
        await page.waitForXPath('(//*[@id="modal-manager"]/div/div/div/div/div[3]/div[2]/button)') //use xPath to to find location of FB login button

        const [fbLogin] = await page.$x('(//*[@id="modal-manager"]/div/div/div/div/div[3]/div[2]/button)')
        fbLogin.click();

        const newPagePromise = new Promise (x =>
            browser.once('targetcreated', target =>x(target.page())) //handle popups such as login in another popup window
            );
        
        const fbPopup = await newPagePromise;
        
        await fbPopup.waitForSelector("#email");
        
        await fbPopup.click("#email");//id is email
        await fbPopup.keyboard.type(username);//enter your username as a string or stored var
        await fbPopup.click("#pass");//id is pass
        await fbPopup.keyboard.type(password);//enter your password as a string or stored var

        await fbPopup.waitForSelector("#loginbutton");
        await fbPopup.click("#loginbutton");

        await page.waitForXPath('(//*[@id="modal-manager"]/div/div/div/div/div[3]/button[1])')
        const [allowLocation] = await page.$x('(//*[@id="modal-manager"]/div/div/div/div/div[3]/button[1])')//allow location 
        allowLocation.click();

        await page.waitForXPath('(/html/body/div[2]/div/div/div/div/div[3]/button[1])')
        const [allowNotifactions] = await page.$x('(/html/body/div[2]/div/div/div/div/div[3]/button[1])')//allow notifactions
        allowNotifactions.click();

        try{
            await page.waitForXPath('(//*[@id="content"]/div/div[1]/div/div/main/div/div[1]/div/div[1]/div[3]/div[1]/div[1]/div/div[2]/div/div)') //wait for new person to load
        }catch(error){
            process.kill();
        }

        setInterval(()=> { //wait time
            page.click("[aria-label='Like']")//swipe right
        }, 300);
    }catch(e){
        process.exit();
    }
        
})()
