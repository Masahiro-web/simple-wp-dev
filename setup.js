// ES Modules形式の書き方に修正
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirnameの代わりに現在のファイルのディレクトリパスを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// wp-env環境を起動
console.log('Starting wp-env environment...');
try {
  execSync('npx wp-env start', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start wp-env:', error);
  process.exit(1);
}

// wp-envのコンテナ名を取得する
console.log('Finding wp-env container names...');
let mysqlContainer = '';

try {
  // wp-envのコンテナを探す - "wordpress-develop"や"mysql"を含むコンテナを検索
  const containers = execSync('docker ps --format "{{.Names}}"').toString().trim().split('\n');
  
  for (const container of containers) {
    if (container.includes('mysql')) {
      mysqlContainer = container;
      console.log(`Found MySQL container: ${mysqlContainer}`);
      break;
    }
  }

  if (!mysqlContainer) {
    throw new Error('MySQL container not found. Make sure wp-env is running.');
  }
} catch (error) {
  console.error('Failed to find containers:', error);
  process.exit(1);
}

// MySQLコンテナが所属するネットワーク名を直接取得（簡略化されたアプローチ）
console.log('Identifying network for MySQL container...');
let wpEnvNetwork = '';

try {
  // この方法では、ネットワーク名を直接取得します（ネットワークIDではなく）
  const cmd = `docker inspect --format "{{range \$k, \$v := .NetworkSettings.Networks}}{{\$k}} {{end}}" ${mysqlContainer}`;
  console.log(`Executing: ${cmd}`);
  
  // 結果には複数のネットワーク名が含まれる可能性がある
  const networks = execSync(cmd).toString().trim().split(' ');
  console.log(`Found networks: ${networks.join(', ')}`);
  
  // 最初のネットワーク名を使用
  if (networks && networks.length > 0 && networks[0]) {
    wpEnvNetwork = networks[0];
    console.log(`Selected network: ${wpEnvNetwork}`);
  } else {
    throw new Error('No networks found for MySQL container');
  }
  
  // ネットワークが実際に存在するか確認
  const allNetworks = execSync('docker network ls --format "{{.Name}}"').toString().trim().split('\n');
  if (!allNetworks.includes(wpEnvNetwork)) {
    throw new Error(`Network ${wpEnvNetwork} not found in available networks`);
  }
  
} catch (error) {
  console.error('Failed to identify network:', error);
  console.error('Error details:', error.message);
  
  // エラーが発生した場合、別の方法を試す
  console.log('Trying alternative approach to identify network...');
  try {
    // ネットワークリストから探す
    const allNetworks = execSync('docker network ls --format "{{.Name}}"').toString().trim().split('\n');
    console.log('Available networks:', allNetworks.join(', '));
    
    // "wordpress"または"wp-env"を含むネットワークを探す
    for (const network of allNetworks) {
      if (network.includes('wordpress') || network.includes('wp-env')) {
        wpEnvNetwork = network;
        console.log(`Found WordPress network: ${wpEnvNetwork}`);
        break;
      }
    }
    
    // デフォルトのネットワーク名も試す
    if (!wpEnvNetwork) {
      const defaultNetworkName = 'travel_order_wp2_default';
      if (allNetworks.includes(defaultNetworkName)) {
        wpEnvNetwork = defaultNetworkName;
        console.log(`Using default network name: ${wpEnvNetwork}`);
      } else {
        console.log('Default network not found');
      }
    }
    
    // それでも見つからない場合はブリッジネットワークを使う
    if (!wpEnvNetwork && allNetworks.includes('bridge')) {
      wpEnvNetwork = 'bridge';
      console.log('Falling back to bridge network');
    }
    
    if (!wpEnvNetwork) {
      throw new Error('Could not identify any usable network');
    }
  } catch (fallbackError) {
    console.error('All attempts to identify network failed:', fallbackError);
    process.exit(1);
  }
}

// docker-compose.phpmyadmin.ymlファイルを動的に生成
console.log('Generating phpMyAdmin Docker Compose file...');

// ネットワーク名に特殊文字が含まれる場合は別の構文を使用
const composeContent = `version: '3'

services:
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    restart: always
    ports:
      - 8080:80
    environment:
      PMA_HOST: mysql
      PMA_USER: root
      PMA_PASSWORD: password
    networks:
      - wordpress_network

networks:
  wordpress_network:
    name: ${wpEnvNetwork}
    external: true
`;

fs.writeFileSync(path.join(__dirname, 'docker-compose.phpmyadmin.yml'), composeContent);

// phpMyAdminを起動
console.log('Starting phpMyAdmin...');
try {
  execSync('docker-compose -f docker-compose.phpmyadmin.yml up -d', { stdio: 'inherit' });
  console.log('\n✅ phpMyAdmin is now running at http://localhost:8080');
  console.log('   - Username: root');
  console.log('   - Password: password');
} catch (error) {
  console.error('Failed to start phpMyAdmin:', error);
  
  // もし上記の方法が失敗した場合は、シンプルな直接docker runコマンドを試す
  console.log('Trying direct docker run approach...');
  try {
    execSync(`docker run --name phpmyadmin -d --network ${wpEnvNetwork} -p 8080:80 -e PMA_HOST=mysql -e PMA_USER=root -e PMA_PASSWORD=password phpmyadmin/phpmyadmin`, { stdio: 'inherit' });
    console.log('\n✅ phpMyAdmin is now running at http://localhost:8080 (direct method)');
  } catch (runError) {
    console.error('All attempts to run phpMyAdmin failed:', runError);
    process.exit(1);
  }
}