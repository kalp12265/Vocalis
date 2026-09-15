import { test, expect } from '@playwright/test';
const base='http://localhost:3000';
test.use({launchOptions:{args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']}});
test('landing is responsive and the demo session persists',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await expect(page.getByRole('heading',{name:'Speak Better. Think Faster.'})).toBeVisible();
 await page.screenshot({path:'/tmp/vocalis-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'See how it works'}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('link',{name:'Try the interactive demo'}).click();
 await expect(page.getByRole('heading',{name:'Explore the sample transcript'})).toBeVisible();
 await page.getByRole('button',{name:'Analyze my response'}).click();await expect(page.getByRole('heading',{name:'A closer listen. A clearer path.'})).toBeVisible();
 await expect(page).toHaveURL(/\/session\//,{timeout:15000});
 await expect(page.getByRole('heading',{name:'Session complete. Progress made.'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Your Vocalis Coach'})).toBeVisible();
 const url=page.url();await page.reload();await expect(page.getByRole('heading',{name:'Session complete. Progress made.'})).toBeVisible();expect(page.url()).toBe(url);
 await page.goto(base+'/history');await expect(page.locator('tbody tr')).toHaveCount(6);
 await page.goto(base+'/progress');await page.getByRole('button',{name:'30 days',exact:true}).click();await page.getByRole('button',{name:'Structure',exact:true}).click();await expect(page.getByRole('img',{name:/Structure scores/})).toBeVisible();
 await page.setViewportSize({width:390,height:844});await page.goto(base);await page.screenshot({path:'/tmp/vocalis-mobile.png',fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
 await page.goto(base+'/practice');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();await page.getByRole('button',{name:'Open navigation'}).click();await expect(page.getByRole('navigation',{name:'Application navigation'})).toBeVisible();
 expect(errors).toEqual([]);
});
test('onboarding, own transcript, topic filters, and profile saving work',async({page})=>{
 await page.goto(base+'/onboarding');await page.getByRole('button',{name:'Interviews',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByRole('button',{name:'Somewhat uncomfortable',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();await page.getByLabel('What should we call you?').fill('Jordan');await page.getByRole('button',{name:'Start Your First Session'}).click();await expect(page).toHaveURL(/\/practice\/interview/);
 await page.getByRole('button',{name:'Use your own transcript'}).click();await page.getByLabel('Session transcript').fill('I believe my strongest quality is helping a team find clarity. For example, last year I worked on a difficult project. First, I listened to everyone involved. Then I organized their ideas into a simple plan. Because each person understood their role, we finished on time. Ultimately, I learned that a good result begins with a clear conversation.');await page.getByRole('button',{name:'Analyze my response'}).click();await expect(page).toHaveURL(/\/session\//,{timeout:15000});await expect(page.getByRole('heading',{name:'Interview focus'})).toBeVisible();
 await page.goto(base+'/topics');await page.getByRole('button',{name:'All prompts',exact:true}).click();await page.getByLabel('Filter by category').selectOption('chaotic');await expect(page.locator('.topic-row')).toHaveCount(4);await page.getByLabel('Filter by completion').selectOption('Completed');await expect(page.getByRole('heading',{name:'A fresh perspective is one filter away.'})).toBeVisible();
 await page.goto(base+'/profile');await expect(page.getByLabel('What should we call you?')).toHaveValue('Jordan');await page.getByLabel('What should we call you?').fill('Sam');await page.getByRole('button',{name:'Save preferences'}).click();await page.reload();await expect(page.getByLabel('What should we call you?')).toHaveValue('Sam');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export my data'}).click();expect((await download).suggestedFilename()).toContain('vocalis-your-progress');
});

test('microphone records playable audio and permission errors recover',async({page})=>{
 await page.goto(base+'/practice/everyday-life');
 await expect(page.locator('.session-timer')).toHaveText('01:00');
 await page.getByRole('button',{name:'Start microphone recording'}).click();
 await expect(page.getByRole('button',{name:'Stop recording'})).toBeVisible({timeout:12000});
 await page.waitForTimeout(1600);
 await page.getByRole('button',{name:'Stop recording'}).click();
 await expect(page.getByRole('heading',{name:'Review your transcript'})).toBeVisible();
 await expect(page.locator('audio')).toHaveAttribute('src',/^blob:/);
 await expect(page.getByRole('link',{name:'Save your recording'})).toBeVisible();
 await page.getByRole('button',{name:'Record again'}).click();
 await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=()=>Promise.reject(new DOMException('Permission denied','NotAllowedError'));});
 await page.getByRole('button',{name:'Start microphone recording'}).click();
 await expect(page.locator('.error-banner[role="alert"]')).toContainText('Microphone access was denied',{timeout:10000});
 await page.getByRole('button',{name:'Use your own transcript'}).click();
 await expect(page.getByLabel('Session transcript')).toBeVisible();
});
