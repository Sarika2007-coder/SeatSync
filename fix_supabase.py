from pathlib import Path

# Patch page4.html by removing duplicate script block.
page4_path = Path('page4.html')
page4 = page4_path.read_text(encoding='utf-8')
first_close = page4.find('</script>')
if first_close == -1:
    raise SystemExit('page4: no first </script> found')
second_close = page4.find('</script>', first_close + len('</script>'))
if second_close == -1:
    raise SystemExit('page4: no second </script> found')
# keep up to and including first close, then from second close onward
page4_fixed = page4[: first_close + len('</script>')] + page4[second_close + len('</script>'):]
page4_path.write_text(page4_fixed, encoding='utf-8')
print('page4 patched')

# Patch page5.html bookingId retrieval.
page5_path = Path('page5.html')
page5 = page5_path.read_text(encoding='utf-8')
old_booking = 'const bookingId =\n            "SS" +\n            Date.now()\n                .toString()\n                .slice(-6);'
new_booking = 'const bookingId =\n            params.get("bookingId") ||\n            "SS" +\n            Date.now()\n                .toString()\n                .slice(-6);'
if old_booking not in page5:
    raise SystemExit('page5: bookingId block not found')
page5_path.write_text(page5.replace(old_booking, new_booking, 1), encoding='utf-8')
print('page5 patched')

# Patch admin-dashboard.html script import.
admin_path = Path('admin-dashboard.html')
admin = admin_path.read_text(encoding='utf-8')
needle = '    <script src="js/script.js"></script>'
replacement = '    <script type="module" src="js/supabase-client.js" defer></script>\n    <script src="js/script.js"></script>'
if needle not in admin:
    raise SystemExit('admin-dashboard: script tag not found')
admin_path.write_text(admin.replace(needle, replacement, 1), encoding='utf-8')
print('admin-dashboard patched')

# Clean up any remaining local backend URLs in js/script.js.
script_path = Path('js/script.js')
script = script_path.read_text(encoding='utf-8')
if 'http://localhost:3000/bookings' in script:
    script = script.replace('http://localhost:3000/bookings', '');
    script_path.write_text(script, encoding='utf-8')
    print('script.js localhost backend references removed')
else:
    print('script.js no localhost backend references found')
