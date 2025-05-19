<?php
/**
 * Theme functions and definitions
 */

// Vite関連の関数
function vite_get_asset_url($asset) {
  if (wp_get_environment_type() === 'local') {
    // 開発環境では、Vite開発サーバーからアセットを取得
    return 'http://localhost:3000/' . $asset;
  } else {
    // 本番環境では、ビルドされたアセットを使用
    $manifest = get_theme_file_path('/dist/manifest.json');
    
    if (file_exists($manifest)) {
      $manifest_content = json_decode(file_get_contents($manifest), true);
      if (isset($manifest_content[$asset])) {
        return get_theme_file_uri('/dist/' . $manifest_content[$asset]['file']);
      }
    }
    
    return get_theme_file_uri('/dist/' . $asset);
  }
}

// スタイルとスクリプトを読み込む
function theme_enqueue_assets() {
  if (wp_get_environment_type() === 'local') {
    // 開発環境では、Vite開発サーバーからHMRスクリプトをモジュールとして読み込む
    wp_enqueue_script_module('vite-client', 'http://localhost:3000/@vite/client', array(), null, false);
  }
  
  wp_enqueue_style('theme-style', vite_get_asset_url('scss/style.scss'), array(), null);
  
  // main.jsもモジュールとして読み込む
  wp_enqueue_script_module('theme-script', vite_get_asset_url('js/main.js'), array(), null, true);
}
add_action('wp_enqueue_scripts', 'theme_enqueue_assets');