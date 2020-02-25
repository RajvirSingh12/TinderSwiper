const puppeteer = require("puppeteer");
const {username, password} = require("./credentials"); //if you choose to put your login credentials in another file 
(async ()=>{
    try{
        const browser = await puppeteer.launch({headless: false});//open browser not in background

        const context = browser.defaultBrowserContext(); //context of tinder browser to click through/on it 
        const page = await browser.newPage();
        await page.goto("https://tinder.com/");
        await context.overridePermissions("https://tinder.com/", ["geolocation"]);//allow location

        await page.setGeolocation({latitude:####, longitude:####});//change ur location
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
        await fbPopup.keyboard.type(username);
        await fbPopup.click("#pass");//id is pass
        await fbPopup.keyboard.type(password);

        await fbPopup.waitForSelector("#loginbutton");
        await fbPopup.click("#loginbutton");

        await page.waitForXPath('(//*[@id="modal-manager"]/div/div/div/div/div[3]/button[1])')//allow location
        const [allowLocation] = await page.$x('(//*[@id="modal-manager"]/div/div/div/div/div[3]/button[1])')
        allowLocation.click();

        await page.waitForXPath('(/html/body/div[2]/div/div/div/div/div[3]/button[1])')//allow notifactions
        //const [allowNotifactions] = await page.$x('(/html/body/div[2]/div/div/div/div/div[3]/button[1])')
        //allowNotifactions.click();
        page.click("[aria-label='Enable']")

        try{//if there is a person to swipe on swipe right
            await page.waitForXPath('(//*[@id="content"]/div/div[1]/div/div/main/div/div[1]/div/div[1]/div[3]/div[1]/div[1]/div/div[2]/div/div)')
        }catch(error){
            process.kill();
        }

        setInterval(()=> {
            page.click("[aria-label='Like']")
        }, 8000);//time before swiping (wait time)
    }catch(e){
        process.exit();
    }
        
})()
