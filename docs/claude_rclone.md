Here's the setup, step by step.

**1. Generate R2 API credentials**

In the Cloudflare dashboard: R2 → Manage R2 API Tokens → Create API Token. Give it Object Read & Write permissions scoped to your bucket, and (cite index="17-1">save the Access Key ID and Secret Access Key it gives you — the secret is shown only once.</cite>

While you're there, grab your **Account ID** (visible on the R2 Overview page) — you'll need it to build the endpoint URL.

**2. Configure rclone**

Easiest is to run the interactive wizard:

```bash
rclone config
```

Choose `n` for a new remote, name it (e.g. `r2`), then when it asks for a storage type choose `s3`, and for the S3 provider choose `Cloudflare`. It'll prompt for your access key, secret key, and endpoint — (cite index="14-1">it's recommended to choose a unique provider name and rely on the default answers for everything else.</cite>

Or skip the wizard and edit the config file directly — (cite index="14-1">it lives at `~/.config/rclone/rclone.conf`</cite>:

```ini
[r2]
type = s3
provider = Cloudflare
access_key_id = <your-access-key-id>
secret_access_key = <your-secret-access-key>
endpoint = https://<account-id>.r2.cloudflarestorage.com
acl = private
region = auto
```

Replace `<account-id>` with your actual Cloudflare account ID.

A couple of gotchas:
- If your API token has **object-level permissions** instead of account/bucket-level, (cite index="14-1">you'll need to add `no_check_bucket = true` to the config to avoid errors.</cite>
- `acl = private` is fine even for a publicly-served bucket — the public access is handled at the R2/custom-domain layer (what we set up earlier), not via S3 ACLs.

**3. Verify it works**

```bash
rclone tree r2:
```

This lists your buckets and their contents so you can confirm the connection is good — (cite index="14-1">e.g. showing your bucket names and the files inside them.</cite> Or scope directly to one bucket:

```bash
rclone tree r2:my-media-bucket
```

**4. Upload your static content**

For a one-time bulk migration of your existing images/audio directory:

```bash
rclone copy ./static-assets r2:my-media-bucket --progress
```

Use `sync` instead of `copy` if you want the bucket to exactly mirror the local folder (i.e. delete-in-bucket files that no longer exist locally) — but be careful with `sync`, it's destructive on the destination side.

For ongoing updates later, you can re-run the same `copy`/`sync` command, or wire it into a GitHub Action so pushing changes to a dedicated assets branch/repo triggers the upload automatically — decoupling it entirely from your Deno Deploy app deploys.

One thing to double check given your R2 credential permissions: is your API token scoped to a **specific bucket**, or account-wide? That affects whether you'll need the `no_check_bucket = true` line.
