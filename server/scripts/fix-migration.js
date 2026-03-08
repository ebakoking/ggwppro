const { execSync } = require('child_process');
const fs = require('fs');

fs.writeFileSync(
  '/tmp/premigrate.sql',
  `DELETE FROM "_prisma_migrations" WHERE "migration_name" = '20260310000000_add_password_reset';`,
);
try {
  execSync(
    'npx prisma db execute --file /tmp/premigrate.sql --schema prisma/schema.prisma',
    { stdio: 'inherit' },
  );
} catch (_) {}
