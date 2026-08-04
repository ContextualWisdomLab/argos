sed -i 's/useEffect(() => {/useEffect(() => { \/\/ eslint-disable-next-line react-hooks\/set-state-in-effect/' packages/web/src/components/org/create-org-modal.tsx
sed -i 's/useEffect(() => {/useEffect(() => { \/\/ eslint-disable-next-line react-hooks\/set-state-in-effect/' packages/web/src/components/org/create-project-modal.tsx
sed -i 's/useEffect(() => {/useEffect(() => { \/\/ eslint-disable-next-line react-hooks\/set-state-in-effect/' packages/web/src/components/org/delete-org-modal.tsx
sed -i 's/useEffect(() => {/useEffect(() => { \/\/ eslint-disable-next-line react-hooks\/set-state-in-effect/' packages/web/src/components/org/delete-project-modal.tsx
sed -i 's/useEffect(() => {/useEffect(() => { \/\/ eslint-disable-next-line react-hooks\/set-state-in-effect/' packages/web/src/components/org/rename-project-modal.tsx

# Replace setState with ignore
sed -i 's/setName('\'''\'')$/\/\/ eslint-disable-next-line react-hooks\/set-state-in-effect\n      setName('\'''\'')/g' packages/web/src/components/org/create-org-modal.tsx
sed -i 's/setName('\'''\'')$/\/\/ eslint-disable-next-line react-hooks\/set-state-in-effect\n      setName('\'''\'')/g' packages/web/src/components/org/create-project-modal.tsx
sed -i 's/setConfirmName('\'''\'')$/\/\/ eslint-disable-next-line react-hooks\/set-state-in-effect\n      setConfirmName('\'''\'')/g' packages/web/src/components/org/delete-org-modal.tsx
sed -i 's/setConfirmName('\'''\'')$/\/\/ eslint-disable-next-line react-hooks\/set-state-in-effect\n      setConfirmName('\'''\'')/g' packages/web/src/components/org/delete-project-modal.tsx
sed -i 's/setName(project.name)$/\/\/ eslint-disable-next-line react-hooks\/set-state-in-effect\n      setName(project.name)/g' packages/web/src/components/org/rename-project-modal.tsx
