{
  'targets': [{
    'target_name': 'libvips-cpp',
    'type': 'shared_library',
    'conditions': [
      ['OS == "win"', {
        'variables': {
          'download_vips': '<!(node -e "require(\'./binding\').download_vips()")'
        },
        'defines': [
          'VIPS_CPLUSPLUS_EXPORTS'
        ],
        'sources': [
          'libvips/cplusplus/VError.cpp',
          'libvips/cplusplus/VInterpolate.cpp',
          'libvips/cplusplus/VImage.cpp'
        ],
        'include_dirs': [
          '<(module_root_dir)/libvips/cplusplus/include',
          '<(module_root_dir)/include',
          '<(module_root_dir)/include/glib-2.0',
          '<(module_root_dir)/lib/glib-2.0/include'
        ],
        'libraries': [
          '<(module_root_dir)/lib/libvips.lib',
          '<(module_root_dir)/lib/libglib-2.0.lib',
          '<(module_root_dir)/lib/libgobject-2.0.lib'
        ],
        'msvs_disabled_warnings': [
          4275
        ],
        'configurations': {
          'Release': {
            'msvs_settings': {
              'VCCLCompilerTool': {
                'ExceptionHandling': 1
              }
            }
          }
        }
      }]
    ]
  }]
}
