from fwidgets.f_boxlayout import FBoxLayout
from fwidgets.f_spinner import FSpinner
from fwidgets.f_label import FLabel
from fwidgets.f_button import FButton
from fwidgets.f_scroll_code_input import FScrollCodeInput
from fwidgets.f_tog_button import FTogButton
from kivy.lang import Builder
from GUI.shaderwidget import ShaderWidget
from GUI.texturechoice import TextureChoice

Builder.load_file('./GUI/shadertoy.kv')


class Shadertoy(FBoxLayout):
    def __init__(self, **kwargs):
        super(Shadertoy, self).__init__(**kwargs)
