import { test, expect } from 'playwright/test';

test('test', async ({ page }) => {

  await page.goto('http://localhost:3001');
  await page.locator("[href='/content/als.html']").first().click();

  await page.locator("#al-dropdown").selectOption("Instructions in English");
  await page.locator("#al-button").click();

  await expect(page.locator("#welcome")).toHaveText("Welcome to DIALANG");
  await expect(page.locator("#legend")).toBeTruthy();

  // Now click next
  await page.locator("#next").click();

  // On the flowchart screen
  await expect(page.locator("#procedure-title")).toHaveText("The PROCEDURE");

  await page.locator("#next").click();

  // Now we should be on the test selection screen and a disclaimer dialog should have popped up.
  // Click the ok button.
  await page.locator("#disclaimer-button").click();

  // Test selection. Pick spanish reading.
  await page.locator(".tls-link[tl='es-ES'][skill='reading']").click();

  // Confirmation dialog. Click yes.
  await page.locator("#confirm-yes").click();

  // Now we should be on the placement test intro screen
  expect(page.locator("#vsptintro-title")).toHaveText("Placement Test");

  await page.locator("#next").click();

  await page.locator('[id="vsptintro-title"]').waitFor({ state: "detached" });

  // Now we should be on the vspt screen
  await expect(page.locator("h1").first()).toHaveText("Placement Test");

  expect(page.locator("#next")).toBeDisabled();

  // Select all the valid words correctly
  await page.keyboard.press("Control+h");

  await expect(page.locator("[id='000905_correct']")).toBeChecked();
  await expect(page.locator("[id='000905_incorrect']")).not.toBeChecked();

  await expect(page.locator("#next")).toBeEnabled();
  await page.locator("#next").click();

  await page.locator("#confirm-send-yes").click();

  // Now we should be on the vspt feedback screen
  await page.locator("#vsptfeedback-title").waitFor({ timeout: 2000 });

  expect(page.locator("#score")).toHaveText("1000");

  expect(page.locator("[aria-controls='tabs-1'][aria-selected='true']")).toBeVisible();

  await page.locator("#next").click();

  await expect(page.locator("#saintro-title")).toHaveText("Self-assessment - reading");

  await page.locator("#next").click();

  await page.locator("#sa-table").waitFor({ timeout: 2000 });

  expect(page.locator("#next")).toBeDisabled();

  // Select all the yes options
  await page.keyboard.press("Control+h");

  expect(page.locator("#next")).toBeEnabled();

  await page.locator("#next").click();

  await page.locator("#confirm-send-yes").click();

  await page.locator("#testintro-title").waitFor({ timeout: 2000 });

  await page.locator("#skipforward").click();
  await page.locator("#confirm-skip-yes").click();

  expect(page.locator("#welcome")).toBeVisible();
  await page.locator("#next").click();
  expect(page.locator("#welcome-title")).toBeVisible();

  expect(page.locator("#placement-test-button")).toBeEnabled();

  // Self assessment feedback only makes sense if we've taken items. We skipped those, so here the
  // button is disabled
  expect(page.locator("#sa-feedback-button")).toBeDisabled();
});
