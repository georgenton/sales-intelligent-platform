#!/bin/zsh
set -eu

environment="${SIP_OVH_ENVIRONMENT:-${1:-}}"
account="${SIP_OVH_ACCOUNT:-${2:-}}"
clipboard_ttl="${SIP_CLIPBOARD_TTL_SECONDS:-60}"
credentials_dir="${SIP_OVH_CREDENTIALS_DIR:-$HOME/.config/sales-intelligence-platform/ovh}"

case "$environment:$account" in
  demo:admin | demo:manager | demo:seller | demo:viewer | staging:admin)
    secret_key='SIP_ADMIN_PASSWORD'
    ;;
  staging:manager)
    secret_key='SIP_MANAGER_PASSWORD'
    ;;
  staging:seller)
    secret_key='SIP_SELLER_PASSWORD'
    ;;
  staging:viewer)
    secret_key='SIP_VIEWER_PASSWORD'
    ;;
  production:edge)
    secret_key='SIP_EDGE_PASSWORD'
    ;;
  production:manager)
    secret_key='SIP_MANAGER_PASSWORD'
    ;;
  production:viewer)
    secret_key='SIP_VIEWER_PASSWORD'
    ;;
  *)
    print -u2 'Choose demo:{admin,manager,seller,viewer}, staging:{admin,manager,seller,viewer}, or production:{edge,manager,viewer}.'
    exit 2
    ;;
esac

credentials_file="$credentials_dir/$environment-access.env"
if [[ ! -d "$credentials_dir" || "$(stat -f '%Lp' "$credentials_dir")" != '700' ]]; then
  print -u2 'The OVH credentials directory must exist with mode 0700.'
  exit 1
fi
if [[ ! -f "$credentials_file" || "$(stat -f '%Lp' "$credentials_file")" != '600' ]]; then
  print -u2 'The selected OVH credentials file must exist with mode 0600.'
  exit 1
fi
if [[ ! "$clipboard_ttl" =~ '^[1-9][0-9]{0,3}$' ]]; then
  print -u2 'SIP_CLIPBOARD_TTL_SECONDS must be between 1 and 9999.'
  exit 2
fi

secret="$(awk -F= -v key="$secret_key" '$1 == key { sub(/^[^=]*=/, ""); print; found += 1 } END { if (found != 1) exit 1 }' "$credentials_file")" || {
  print -u2 'The selected secret could not be read safely.'
  exit 1
}
if [[ -z "$secret" || "$secret" == *$'\n'* ]]; then
  print -u2 'The selected secret could not be read safely.'
  exit 1
fi

printf '%s' "$secret" | pbcopy
(
  sleep "$clipboard_ttl"
  if [[ "$(pbpaste)" == "$secret" ]]; then
    printf '' | pbcopy
  fi
) </dev/null >/dev/null 2>&1 &!

unset secret
