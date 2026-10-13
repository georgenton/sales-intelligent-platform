#!/bin/zsh
set -eu

credentials_file="${SIP_UAT_CREDENTIALS_FILE:-$HOME/.config/sales-intelligence-platform/uat-credentials.txt}"
account_index="${SIP_UAT_ACCOUNT_INDEX:-${1:-}}"
clipboard_ttl="${SIP_CLIPBOARD_TTL_SECONDS:-60}"

if [[ ! -f "$credentials_file" ]]; then
  print -u2 'UAT credentials file not found.'
  exit 1
fi

if [[ "$(stat -f '%Lp' "$credentials_file")" != '600' ]]; then
  print -u2 'UAT credentials file must have mode 0600.'
  exit 1
fi

if [[ ! "$account_index" =~ '^[1-6]$' ]]; then
  print -u2 'Set SIP_UAT_ACCOUNT_INDEX to an integer from 1 to 6.'
  exit 2
fi

if [[ ! "$clipboard_ttl" =~ '^[1-9][0-9]{0,3}$' ]]; then
  print -u2 'SIP_CLIPBOARD_TTL_SECONDS must be between 1 and 9999.'
  exit 2
fi

password="$({
  awk -v wanted="$account_index" '
    /^Password:[[:space:]]*$/ { record_number += 1; capture = record_number == wanted; next }
    capture && NF { print; exit }
  ' "$credentials_file"
} | tr -d '\r')"

if [[ -z "$password" || "$password" == *$'\n'* ]]; then
  print -u2 'The selected UAT password could not be read safely.'
  exit 1
fi

printf '%s' "$password" | pbcopy

(
  sleep "$clipboard_ttl"
  if [[ "$(pbpaste)" == "$password" ]]; then
    printf '' | pbcopy
  fi
) </dev/null >/dev/null 2>&1 &!

unset password
