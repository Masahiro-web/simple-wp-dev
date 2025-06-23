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
    $manifest = get_theme_file_path('/dist/.vite/manifest.json');
    
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
    // 開発環境では、Vite開発サーバーからHMRスクリプトとして読み込む
    wp_enqueue_script('vite-client', 'http://localhost:3000/@vite/client', array(), null, true);
  }
    wp_enqueue_style('theme-style', vite_get_asset_url('scss/style.scss'), array(), null);
    
    // main.jsをモジュールとして読み込む
    wp_enqueue_script('theme-script', vite_get_asset_url('js/main.js'), array(), null, true);

}
add_action('wp_enqueue_scripts', 'theme_enqueue_assets');

// type="module"属性を付与するフィルター
function add_module_type_attribute($tag, $handle, $src) {
  // Vite関連のスクリプトにtype="module"を追加
  if (in_array($handle, ['vite-client', 'theme-script'])) {
    $tag = str_replace('<script ', '<script type="module" ', $tag);
  }
  return $tag;
}
add_filter('script_loader_tag', 'add_module_type_attribute', 10, 3);
