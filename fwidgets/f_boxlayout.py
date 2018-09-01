'''
Created on Jul 7, 2016

@author: dan
'''
from fwidgets.f_widget import FWidget
from kivy.uix.boxlayout import BoxLayout


class FBoxLayout(BoxLayout, FWidget):

    def __init__(self, **kwargs):
        
        super(FBoxLayout, self).__init__(**kwargs)
#         self.outline_color = ['White', '500']
        
