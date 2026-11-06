# One-time import of patient guides

Uploads the client's patient guide PDFs and connects them to the inhalers through the normal admin API. The connections come from `productGuides.json`, which was made from the client's Word list "Tuotekohtaiset potilasohjeet lueteltuna.docx".

Take a database backup from the admin panel first. Then do a dry run, which changes nothing:

```node scripts/guides/importGuides.js url=https://inhalaattorit.fi username={username} password={password} dir={folder with the PDFs}```

If the output looks right, run it again with `apply=1`.

The script can be run again safely. Guides that already exist (same Finnish name) are reused without uploading again, and inhalers that already have guides are left alone. At the end it lists the inhalers the client needs to check and set by hand.
