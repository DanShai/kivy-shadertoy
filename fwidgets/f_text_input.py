'''

@author: dan
'''

from kivy.lang import Builder
from kivy.properties import ListProperty, ObjectProperty, StringProperty
from pygments.lexers.graphics import GLShaderLexer

from .f_widget import FWidget
from .mcodeinput import MCodeInput
from .utils import get_rgba_color as get_color


class FTextInput(MCodeInput):
    get_color = ObjectProperty(get_color)

    def __init__(self, **kwargs):
        super(FTextInput, self).__init__(**kwargs)
        self.background_color = [.9, .92, .92, 1]
        self.foreground_color = self.get_color(['Red', '700'], 1)
        self.auto_indent = True
        self.font_size = '32dp'
        self.bg_color = ['Orange', '800']
        #self.p_width = 2
        #self.outline_color = ['Orange', '300']
        #self.cursor_color = self.get_color(['Red', '700'], 1)
        #self.cursor_blink = True
        #self.cursor_width = 10
        self.focus = True
        self.lexer = GLShaderLexer()
        #self.style_name = "monokai"
        self.use_bubble = True

    def center_text(self):
        self.padding_x = [self.center[0] + 2 * self._get_text_width(max(self._lines, key=len),
                                                                    self.tab_width, self._label_cached), 0] if self.text else [self.center[0], 0]
        # top, bottom
        self.padding_y = [self.height -
                          (self.line_height) * len(self._lines), 0]
