'''
Created on Dec 7, 2017

@author: dan
'''
#import os
#os.environ['KIVY_GL_BACKEND'] = 'sdl2'

from GUI.shadertoy import Shadertoy
from kivy.app import App
from kivy.core.window import Window
from kivy.config import Config
#Config.set('graphics', 'width', '400')
#Config.set('graphics', 'height', '400')
Config.set('postproc', 'maxfps', '0')
Config.write()
Window.size = (80 * 16, 80 * 12)


class ShaderApp(App):
    def build(self):
        return Shadertoy()

    def warn(self, message):
        print(message)


if __name__ == '__main__':
    app = ShaderApp()
    app.run()
