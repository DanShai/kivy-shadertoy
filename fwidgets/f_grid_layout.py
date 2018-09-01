'''
Created on Jul 7, 2016

@author: dan
'''
from fwidgets.f_widget import FWidget
from kivy.uix.gridlayout import GridLayout


class FGridLayout(GridLayout, FWidget):

    def __init__(self, **kwargs):

        
        super(FGridLayout, self).__init__(**kwargs)
        self.outline_color = ['White', '500']
        
