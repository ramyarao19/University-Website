# E2E Test Scenarios

**Total: 209 test cases** across 11 spec files, each running on 4 browsers (Chromium, Firefox, WebKit, Mobile Chromium) = **836 test executions**

---

## 1. Navigation (24 tests) — `navigation.spec.ts`

### Core Routing
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Load app with no URL hash | Home page is displayed by default |
| 2 | Navigate to Home via nav | Home page becomes active |
| 3 | Navigate to Academics via nav | Academics page becomes active |
| 4 | Navigate to Admissions via nav | Admissions page becomes active |
| 5 | Navigate to About via nav | About page becomes active |
| 6 | Navigate to Campus Life via nav | Campus Life page becomes active |
| 7 | Navigate to Portal via nav | Portal page becomes active |
| 8 | Navigate to Internship Form via nav | Internship Form page becomes active |

### Page Titles
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 9 | Visit Home page | Title is "The Scholarly Editorial \| University Home" |
| 10 | Visit Academics page | Title is "Academics \| The Scholarly Editorial" |
| 11 | Visit Admissions page | Title is "Admissions \| The Scholarly Editorial" |
| 12 | Visit About page | Title is "About Us \| The Scholarly Editorial" |
| 13 | Visit Campus Life page | Title is "Campus Life \| The Scholarly Editorial" |
| 14 | Visit Portal page | Title is "Student Portal \| The Scholarly Editorial" |
| 15 | Visit Internship Form page | Title is "Internship Application \| The Scholarly Editorial" |

### Browser History & URL
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 16 | Set active CSS class on current nav link | `.active` class applied to current link |
| 17 | Click browser back button after navigating | Returns to previous page |
| 18 | Change URL hash directly (`#academics`, `#admissions`) | Correct page activates on hash change |
| 19 | Load page with direct URL hash (`/#about`) | About page is active on initial load |

### Portal Mode
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 20 | Navigate to Portal page | `body.portal-mode` class is added |
| 21 | Navigate away from Portal to Home | `body.portal-mode` class is removed |

### Edge Cases
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 22 | Navigate to unknown hash (`#nonexistent`) | App handles gracefully without crashing |
| 23 | Update active nav link between pages | Previous link loses `.active`, new link gains it |
| 24 | Navigate to Internship Form | `body.portal-mode` is set (portal sub-page) |
| 25 | Navigate to new page after scrolling | Window scrolls to top |
| 26 | Navigate to any page | URL hash updates accordingly |
| 27 | Navigate rapidly through 4 pages in sequence | Final page is correctly active |
| 28 | Visit Home page | Title contains "The Scholarly Editorial" |

---

## 2. Search Overlay (18 tests) — `search-overlay.spec.ts`

### Core Functionality
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Press Ctrl+K | Search overlay opens with `.open` class |
| 2 | Open overlay with empty input | All 7 page results are displayed |
| 3 | Type "admissions" in search | Results filter to show Admissions page |
| 4 | Type "tuition" (a keyword, not page name) | Admissions page appears (keyword match) |
| 5 | Type "xyznonexistent" | "No results found" message displayed |
| 6 | Click a search result | Navigates to that page, overlay closes |
| 7 | Type "athletics" and click first result | Navigates to Campus Life page |
| 8 | Press Escape while overlay is open | Overlay closes |
| 9 | Click on overlay backdrop | Overlay closes |
| 10 | Close and reopen overlay | Search input is cleared |

### Edge Cases
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 11 | Search with whitespace only (`"   "`) | All 7 pages shown (treated as empty query) |
| 12 | Search with special characters (`".*[]()"`) | No crash; shows 0 results |
| 13 | Search "scholar" (partial keyword match) | Matches Admissions page ("scholarships" keyword) |
| 14 | Search "ACADEMICS" (uppercase) | Case-insensitive; finds Academics page |
| 15 | Search gibberish (`"zzzzzzzzz123"`) | "No results found" message shown |
| 16 | Click search result for Portal | Overlay closes and Portal page activates |
| 17 | Open search overlay | All 7 page labels visible: Home, Academics, Admissions, About Us, Campus Life, Student Portal, Internship Application |
| 18 | Open search overlay | Search input is auto-focused |

---

## 3. Tuition Calculator (25 tests) — `tuition-calculator.spec.ts`

### Default State
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Load Admissions page | Calculator displays "$0/year" |
| 2 | Load Admissions page | CALCULATE button text is visible |

### Rate Calculations
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 3 | In-State + In-Person + On-Campus | Total = $44,100 |
| 4 | Out-of-State + In-Person + Off-Campus | Total = $55,300 |
| 5 | International + Online | Total = $33,400 |
| 6 | In-State + In-Person + Family | Total = $31,300 |
| 7 | In-State + Online | Total = $18,500 |

### Housing Toggle (Online/In-Person)
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 8 | Select "Online" modality | Housing dropdown disabled, opacity 0.4 |
| 9 | Switch Online → In-Person | Housing dropdown re-enabled, opacity 1 |

### Breakdown Display
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 10 | Select In-State + In-Person + On-Campus | Breakdown shows Tuition, Fees, and Housing lines |
| 11 | Select International + Online | Breakdown shows Tuition and Fees; no Housing line; shows "Online students are not charged housing fees" |

### Negative Scenarios
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 12 | Select only Modality + Housing (no Residency) | Total stays at $0 |
| 13 | Click CALCULATE with no selections | Error toast: "required fields" |
| 14 | Navigate away from Admissions and return | Calculator resets to $0 |

### Edge Cases
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 15 | Toggle Online→In-Person→Online→In-Person→Online | Housing disabled/enabled correctly each time |
| 16 | Select only Modality (no Residency) | Total stays at $0 |
| 17 | Select only Housing (no Residency or Modality) | Total stays at $0 |
| 18 | Click CALCULATE with only Residency selected | Error toast: "required fields" |
| 19 | Out-of-State + Online | Total = $27,100 |
| 20 | International + In-Person + Off-Campus | Total = $66,100 |
| 21 | International + In-Person + Family | Total = $56,500 |
| 22 | Select all options → switch to Online | Housing resets; total recalculates without housing |
| 23 | Change dropdown values without clicking CALCULATE | Total auto-updates on dropdown change |
| 24 | Calculate, navigate away, navigate back | Breakdown text is cleared |
| 25 | Click CALCULATE with all valid selections | Info toast: "updated" |

---

## 4. Contact Form (21 tests) — `contact-form.spec.ts`

### Validation
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Submit empty form | Errors on first-name, last-name, and message fields |
| 2 | Submit with empty first name | Error: "First name is required" |
| 3 | Submit with empty last name | Error: "Last name is required" |
| 4 | Submit with empty message | Error: "Message is required" |
| 5 | Submit without major | No error on major (it's optional) |
| 6 | Submit empty form | `.field-error` class added to invalid fields |
| 7 | Submit empty form | Error toast: "required fields" |

### Successful Submission
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 8 | Fill required fields and submit | Success screen displayed |
| 9 | Submit valid form | Checkmark icon visible in success screen |
| 10 | Submit valid form | Reference ID shown in success screen |
| 11 | Submit valid form | Success toast: "submitted successfully" |
| 12 | Submit with all fields including major | Success screen displayed |

### Error Recovery
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 13 | Submit empty, then fill first name and resubmit | First name error clears |

### Edge Cases & Negative Scenarios
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 14 | Submit with whitespace-only first name (`"   "`) | Error on first-name (trimmed = empty) |
| 15 | Submit with whitespace-only last name (`"   "`) | Error on last-name |
| 16 | Submit with whitespace-only message (`"    "`) | Error on message |
| 17 | Submit with special characters in names (`"O'Brien-Smith"`, `"García"`) | Submission succeeds |
| 18 | Submit empty form | All 3 error messages shown simultaneously |
| 19 | Submit empty, fill all fields, resubmit | All `.field-error` classes removed |
| 20 | Submit with 5,000 character message | Submission succeeds |
| 21 | Submit valid form | Reference ID is a non-empty unique string |

---

## 5. Internship Application Form (33 tests) — `internship-form.spec.ts`

### Validation
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Submit empty form | Errors on full-name, student-id, email, major, statement |
| 2 | Submit with invalid email format (`"not-an-email"`) | Form stays visible; error toast shown |
| 3 | Submit with valid email | No email error |
| 4 | Submit with only required fields filled | GPA and portfolio do not show errors; form succeeds |
| 5 | Submit empty form | Error toast: "required fields" |

### Draft System
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 6 | Fill partial form and click Save Draft | Draft saved to localStorage under `scholarly_db.drafts['internship-app']` |
| 7 | Save draft, navigate away, navigate back | Draft fields auto-populated |
| 8 | Save draft, navigate away, reload, navigate back | Info toast: "Draft loaded" |
| 9 | Save draft, fill all fields, submit successfully | Draft cleared from localStorage |

### File Upload
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 10 | Upload a PDF file | Filename displayed in file info area |
| 11 | Upload a PDF file | `.has-file` class added to upload zone |
| 12 | Upload file larger than 10MB | Error toast: "10MB" |
| 13 | Upload file, then click remove | `.has-file` class removed |

### Submission
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 14 | Fill all required fields and submit | Success screen displayed |
| 15 | Submit valid form | Success screen shows "Reference:" with ID |
| 16 | Submit valid form | "Return to Dashboard" button visible |
| 17 | Click "Return to Dashboard" after submission | Navigates to Portal page |
| 18 | Submit valid form | Success toast: "submitted successfully" |

### Edge Cases & Negative Scenarios
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 19 | Submit with whitespace-only full name (`"   "`) | Error on full-name |
| 20 | Submit with whitespace-only student ID (`"   "`) | Error on student-id |
| 21 | Submit with whitespace-only statement (`"   "`) | Error on statement |
| 22 | Submit with email missing domain extension (`"user@domain"`) | Form stays visible (validation fails) |
| 23 | Submit with email containing spaces (`"user @test.com"`) | Form stays visible (validation fails) |
| 24 | Submit empty form | First error field is scrolled into view |
| 25 | Submit empty form | All 5 error messages shown simultaneously |
| 26 | Save draft, change values, save again | Draft overwritten with new values |
| 27 | Save draft with multiple fields, reload page, navigate back | All draft fields restored (name, email, student ID) |
| 28 | Upload file exactly 10MB | File accepted (limit is strictly > 10MB) |
| 29 | Upload a file | File size shown in KB |
| 30 | Upload a file | Success toast showing filename |
| 31 | Upload file and save draft | File is NOT persisted in draft (only form field values are saved) |
| 32 | Submit empty (errors), fill all fields, resubmit | Errors clear and submission succeeds |
| 33 | Submit with Unicode/special chars in name and statement (`"María O'Connor-López"`, `"研究 & développement"`) | Submission succeeds |
| 34 | Submit with GPA, graduation, portfolio left empty | Submission succeeds (they're optional) |

---

## 6. Portal Dashboard (19 tests) — `portal-dashboard.spec.ts`

### Student Info
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Load Portal page | Student name "Julian Thorne" displayed |
| 2 | Load Portal page | Outstanding balance "$1240.00" displayed |
| 3 | Load Portal page | Unpaid fee items listed (includes "Tuition") |
| 4 | Load Portal page | Settle Fees button is enabled |

### Settle Fees Flow
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 5 | Click Settle Fees | Modal opens with "Settle Outstanding Fees" title |
| 6 | Click Settle Fees | Modal shows total "$1240.00" |
| 7 | Click Cancel in settle modal | Modal closes, balance unchanged |
| 8 | Click Pay Now | Balance updates to "$0.00" |
| 9 | Click Pay Now | Billing items show "All fees are paid" |
| 10 | Click Pay Now | Settle button disabled, text changes to "ALL PAID" |
| 11 | Click Pay Now | Success toast: "settled" |

### Edge Cases & Negative Scenarios
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 12 | Verify fee total math | $850 + $375 + $15 = $1240.00 |
| 13 | Check billing items text | Shows "Tuition", "Housing", and "Library Fine" |
| 14 | Open settle modal and inspect items | Lists all 3 fees with correct amounts ($850, $375, $15) |
| 15 | Pay all fees, navigate to Home, return to Portal | Balance still shows $0.00 |
| 16 | Pay all fees, navigate away, return | Settle button remains disabled |
| 17 | Open settle modal, click Cancel | Modal closes, balance stays $1240.00 |
| 18 | Load Portal page | Student email "j.thorne@scholarly.edu" displayed |

---

## 7. Notifications (16 tests) — `notifications.spec.ts`

### Core Functionality
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Load Portal page | Notification badge visible (2 unread) |
| 2 | Click notification toggle button | Dropdown opens with `.open` class |
| 3 | Open dropdown | 4 notification items displayed |
| 4 | Open dropdown | 2 items have `.unread` class |
| 5 | Open dropdown | 2 `.notif-dot` indicators shown |
| 6 | Click an unread notification | Item loses `.unread` class |
| 7 | Click "Mark all read" | All items lose `.unread` class |
| 8 | Mark all as read | Notification badge hidden |
| 9 | Press Escape while dropdown is open | Dropdown closes |

### Edge Cases & Negative Scenarios
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 10 | Open dropdown | Shows correct titles: "Tuition payment due", "New internship posted", "Library fine overdue", "Course registration opens" |
| 11 | Open dropdown | Time labels displayed ("2 hours ago", "1 day ago") |
| 12 | Click unread notification | Notif-dot removed but item still present (total remains 4) |
| 13 | Mark all read, close dropdown, reopen | 0 unread notifications on reopen |
| 14 | Open dropdown | "Mark all read" button visible in header |
| 15 | Open dropdown | "Notifications" label in header |
| 16 | Click first unread, then second unread | Badge count decrements correctly to 0, badge hides |

---

## 8. Academics Filter (15 tests) — `academics-filter.spec.ts`

### Core Filtering
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Load Academics page | All college cards visible |
| 2 | Type "engineering" in search | Matching cards shown, count reduced |
| 3 | Search "ENGINEERING" vs "engineering" | Same results (case-insensitive) |
| 4 | Select "graduate" from level dropdown | Only graduate cards visible |
| 5 | Select "stem" from area dropdown | Only STEM cards visible |
| 6 | Combine level "graduate" + area "stem" | Intersection of both filters |
| 7 | Search "xyznonexistent" | All cards get `.hidden-filter` class |
| 8 | Search "xyznonexistent", then clear filters | All cards restored |

### Edge Cases & Negative Scenarios
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 9 | Search with whitespace only (`"   "`) | All cards shown |
| 10 | Search with special characters (`"[].*()"`  ) | No crash; handles gracefully |
| 11 | Filter by level, then reset to "all" | All cards restored |
| 12 | Filter by area, then reset to "all" | All cards restored |
| 13 | Search "xyznonexistent" + level "graduate" | 0 visible cards |
| 14 | Type a single character "e" | Cards filter in real-time |
| 15 | Set level filter, add search, clear search only | Level filter still active |

---

## 9. Mobile Navigation (9 tests) — `mobile.spec.ts`

### Core Mobile Behavior (viewport 390×844)
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Load app on mobile viewport | Hamburger button visible |
| 2 | Click hamburger button | Mobile menu opens with `.open` class |
| 3 | Click hamburger button | `#mobile-menu` has `.open` class |
| 4 | Click "Academics" in mobile menu | Navigates to Academics page |
| 5 | Press Escape while menu is open | Menu closes |

### Edge Cases
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 6 | Click nav link in mobile menu | Target page activates |
| 7 | Open menu, close with Escape, reopen | Menu opens again correctly |
| 8 | Load on mobile viewport | Desktop nav links are hidden |
| 9 | Start on mobile (hamburger visible), resize to desktop | Hamburger button hides |

---

## 10. Keyboard Shortcuts (10 tests) — `keyboard-shortcuts.spec.ts`

### Search Shortcut
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Press Ctrl+K | Search overlay opens |
| 2 | Press Cmd+K (Meta+K) | Search overlay opens |

### Escape Key Priority Chain
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 3 | Escape with search overlay open | Search closes |
| 4 | Escape with modal open (no search) | Modal closes |
| 5 | Escape with both search + modal open | Search closes first; second Escape closes modal |
| 6 | Escape with both search + mobile menu open | Search closes first; second Escape closes mobile menu |
| 7 | Escape with notification dropdown open (nothing else) | Dropdown closes |

### Additional Shortcuts
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 8 | Press Ctrl+K while search is already open | Search toggles closed |
| 9 | Press Ctrl+K on any page | Browser default behavior prevented; search opens |

---

## 11. UI Components (16 tests) — `ui-components.spec.ts`

### Toast System
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 1 | Trigger a toast | Toast gains `.show` class and is visible |
| 2 | Trigger success toast with "Hello World" | Toast displays "Hello World" |
| 3 | Trigger success toast | Icon is `check_circle` |
| 4 | Trigger error toast | Icon is `error` |
| 5 | Trigger info toast | Icon is `info` |
| 6 | Trigger toast with 500ms duration | Toast auto-removes after duration + animation |

### Modal System
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 7 | Open modal with title and body | Modal visible with correct content |
| 8 | Open modal | `#modal-overlay` has `.open` class |
| 9 | Press Escape while modal is open | Modal closes |
| 10 | Click on modal backdrop | Backdrop click behavior tested |
| 11 | Open modal with 2 action buttons | Both buttons rendered |
| 12 | Click action button with `closeModal()` handler | Modal closes |
| 13 | Open modal, then open another modal | Content replaced with second modal's content |

### Toast Edge Cases
| # | Scenario | Expected Outcome |
|---|----------|-----------------|
| 14 | Trigger toast with unknown type (`"warning"`) | Falls back to `info` icon |
| 15 | Trigger 3 toasts simultaneously | All 3 toasts stack in container |
| 16 | Trigger toast with 300ms duration | Toast removed after short duration |

---

## Summary by Feature Area

| Feature | Spec File | Tests |
|---------|-----------|-------|
| Navigation & Routing | `navigation.spec.ts` | 24 |
| Search Overlay | `search-overlay.spec.ts` | 18 |
| Tuition Calculator | `tuition-calculator.spec.ts` | 25 |
| Contact Form | `contact-form.spec.ts` | 21 |
| Internship Application | `internship-form.spec.ts` | 33 |
| Portal Dashboard & Billing | `portal-dashboard.spec.ts` | 19 |
| Notifications | `notifications.spec.ts` | 16 |
| Academics Filter | `academics-filter.spec.ts` | 15 |
| Mobile Navigation | `mobile.spec.ts` | 9 |
| Keyboard Shortcuts | `keyboard-shortcuts.spec.ts` | 10 |
| UI Components (Toasts & Modals) | `ui-components.spec.ts` | 16 |
| **Total unique scenarios** | | **209** |
| **Total executions (× 4 browsers)** | | **836** |

## Browsers Tested
- Chromium (desktop)
- Firefox (desktop)
- WebKit / Safari (desktop)
- Mobile Chromium (iPhone 13 — 390×844 viewport)
