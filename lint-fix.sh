sed -i 's/setHover({ kind: '\''event'\'', idx, x: trackMouse(e) })/setHover({ kind: '\''event'\'', idx, x: e.clientX })/' packages/web/src/components/dashboard/session-activity-ribbon.tsx
sed -i 's/x: trackMouse(e)/x: e.clientX/' packages/web/src/components/dashboard/session-activity-ribbon.tsx
